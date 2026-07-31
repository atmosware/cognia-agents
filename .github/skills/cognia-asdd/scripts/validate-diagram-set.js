#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findUnsafeSvgContent } from './sanitize-svg.js';

const SECTION_SLUGS = [
  'high-level-architecture',
  'deployment-topology',
  'data-model-overview',
  'inter-service-communication',
];

function attributes(source) {
  return Object.fromEntries(
    [...source.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function count(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function validateDrawio(source, expectedSlug) {
  const problems = [];
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<mxfile\b/i.test(source) || !/<\/mxfile>\s*$/i.test(source)) {
    problems.push('.drawio must have one complete mxfile root');
  }

  const diagrams = [...source.matchAll(/<diagram\b([^>]*)>/gi)];
  if (diagrams.length !== 1) problems.push('.drawio must contain exactly one diagram');
  else if (attributes(diagrams[0][1]).id !== expectedSlug) {
    problems.push(`diagram id must equal ${expectedSlug}`);
  }

  const cells = [...source.matchAll(/<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/gi)].map(
    (match) => ({ attrs: attributes(match[1]), body: match[2] || '' }),
  );
  const vertices = cells.filter((cell) => cell.attrs.vertex === '1');
  const edges = cells.filter((cell) => cell.attrs.edge === '1');
  const vertexIds = vertices.map((cell) => cell.attrs.id);

  if (vertexIds.some((id) => !id)) problems.push('every vertex must have an id');
  if (new Set(vertexIds).size !== vertexIds.length) problems.push('vertex ids must be unique');
  for (const vertex of vertices) {
    const geometry = vertex.body.match(/<mxGeometry\b([^>]*)\/?\s*>/i);
    const values = geometry ? attributes(geometry[1]) : {};
    if (!['x', 'y', 'width', 'height'].every((name) => values[name] !== undefined)) {
      problems.push(`vertex ${vertex.attrs.id || '(unknown)'} lacks complete geometry`);
    }
    if (/\{[^}]+\}/.test(vertex.attrs.value || '')) {
      problems.push(`vertex ${vertex.attrs.id || '(unknown)'} contains a placeholder`);
    }
  }
  for (const edge of edges) {
    if (!vertexIds.includes(edge.attrs.source) || !vertexIds.includes(edge.attrs.target)) {
      problems.push(`edge ${edge.attrs.id || '(unknown)'} has an invalid source or target`);
    }
  }
  if (vertices.length === 0) problems.push('.drawio contains no vertices');
  return problems;
}

function validateSvg(source) {
  const problems = findUnsafeSvgContent(source);
  const opening = source.match(/<svg\b([^>]*)>/i);
  if (!opening) return [...problems, 'SVG root not found'];
  const root = attributes(opening[1]);
  if (!root.viewBox?.trim()) problems.push('SVG viewBox is missing');
  if (root.role !== 'img') problems.push('SVG role must be img');
  if (root['aria-labelledby'] !== 'diagram-title diagram-description') {
    problems.push('SVG aria-labelledby is incomplete');
  }
  if (!/<title\b[^>]*id=["']diagram-title["'][^>]*>[^<]+<\/title>/i.test(source)) {
    problems.push('SVG accessible title is missing');
  }
  if (!/<desc\b[^>]*id=["']diagram-description["'][^>]*>[^<]+<\/desc>/i.test(source)) {
    problems.push('SVG accessible description is missing');
  }
  if (!/<\/svg>\s*$/i.test(source)) problems.push('SVG closing element is missing');
  return problems;
}

function validateHtml(source, basename) {
  const problems = [];
  const forbidden = [
    /<script\b/i,
    /data-mxgraph/i,
    /<svg\b/i,
    /<(?:iframe|object|embed|link)\b/i,
    /\son[a-z]+\s*=/i,
    /@import\s+(?:url\s*\()?\s*["']?https?:/i,
    /url\s*\(\s*["']?https?:/i,
  ];
  if (forbidden.some((pattern) => pattern.test(source))) {
    problems.push('HTML contains embedded or active viewer content');
  }
  if (/(?:href|src)\s*=\s*["']\s*https?:/i.test(source)) {
    problems.push('HTML contains a remote dependency');
  }

  const imagePattern = new RegExp(`<img\\b[^>]*src=["']\\./${basename}\\.svg["']`, 'gi');
  if (count(source, imagePattern) !== 1) problems.push('HTML must reference the sibling SVG once');
  if (count(source, /<img\b/gi) !== 1) problems.push('HTML must contain exactly one image');
  for (const extension of ['svg', 'drawio']) {
    const link = new RegExp(`href=["']\\./${basename}\\.${extension}["']`, 'i');
    if (!link.test(source)) problems.push(`HTML link to sibling .${extension} is missing`);
  }

  const requiredText = [
    'Purpose and scope',
    'Architecture view',
    'Evidence basis',
    'Components',
    'Communication and relationships',
    'Critical operations',
    'Consistency boundary',
    'Failure handling',
    'Security',
    'Observability',
    'Constraints, decisions, and trade-offs',
  ];
  for (const text of requiredText) {
    if (!source.includes(text)) problems.push(`HTML required detail is missing: ${text}`);
  }
  if (!/Architecture view<\/dt>\s*<dd[^>]*>\s*(?:Current|Target|Migration)\s*<\/dd>/i.test(source)) {
    problems.push('HTML architecture view value must be Current, Target, or Migration');
  }
  if (!/Evidence basis<\/dt>\s*<dd[^>]*>[\s\S]*?(?:Greenfield|Existing(?: system|-system)|Hybrid)[\s\S]*?<\/dd>/i.test(source)) {
    problems.push('HTML evidence basis must identify Greenfield, Existing system, or Hybrid');
  }

  if (/\{(?:Diagram|Component|Source|Target|Critical|What|How|Material|project_name|section-slug)[^}]*\}/i.test(source)) {
    problems.push('HTML contains a template placeholder');
  }
  return problems;
}

function slugForBase(basePath) {
  return SECTION_SLUGS.find((slug) => basePath.endsWith(`-${slug}`));
}

export function validateDiagramSet({ basePath, asddContent = null }) {
  const problems = [];
  const basename = path.basename(basePath);
  const slug = slugForBase(basePath);
  if (!slug) return [`cannot derive a supported section slug from ${basename}`];

  const files = Object.fromEntries(
    ['drawio', 'svg', 'html'].map((extension) => [extension, `${basePath}.${extension}`]),
  );
  for (const [extension, filePath] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) problems.push(`missing .${extension} artifact: ${filePath}`);
  }
  if (problems.length > 0) return problems;

  problems.push(...validateDrawio(fs.readFileSync(files.drawio, 'utf8'), slug));
  problems.push(...validateSvg(fs.readFileSync(files.svg, 'utf8')));
  problems.push(...validateHtml(fs.readFileSync(files.html, 'utf8'), basename));

  if (asddContent !== null) {
    for (const extension of ['drawio', 'svg', 'html']) {
      if (!asddContent.includes(`diagrams/${basename}.${extension}`)) {
        problems.push(`ASDD link to ${basename}.${extension} is missing`);
      }
    }
  }
  return [...new Set(problems)];
}

function parseArguments(argv) {
  const args = { asdd: null, visualStatus: null, bases: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--asdd') args.asdd = argv[++index];
    else if (value === '--visual-status') args.visualStatus = argv[++index];
    else args.bases.push(value);
  }
  if (!args.asdd || args.bases.length === 0 || !['passed', 'unavailable'].includes(args.visualStatus)) {
    throw new Error(
      'Usage: node validate-diagram-set.js --asdd <project-asdd.md> --visual-status <passed|unavailable> <diagram-base> [...]',
    );
  }
  return args;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const args = parseArguments(process.argv.slice(2));
    const asddContent = fs.readFileSync(args.asdd, 'utf8');
    let failed = false;
    for (const basePath of args.bases) {
      const problems = validateDiagramSet({ basePath, asddContent });
      if (problems.length === 0) console.log(`PASS ${basePath}`);
      else {
        failed = true;
        console.error(`FAIL ${basePath}`);
        for (const problem of problems) console.error(`  - ${problem}`);
      }
    }
    if (args.visualStatus === 'unavailable') {
      console.warn('WARN rendered visual validation was unavailable; do not claim full visual validation.');
    } else {
      console.log('PASS rendered visual validation recorded by the agent.');
    }
    if (failed) process.exitCode = 1;
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
