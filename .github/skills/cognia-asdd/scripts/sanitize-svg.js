#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function removeAttribute(openingTag, name) {
  return openingTag.replace(new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*')`, 'gi'), '');
}

export function findUnsafeSvgContent(svg) {
  const problems = [];
  const checks = [
    ['DOCTYPE declaration', /<!DOCTYPE\b/i],
    ['script element', /<script\b/i],
    ['event-handler attribute', /\son[a-z]+\s*=/i],
    ['active embedded element', /<(?:iframe|object|embed|link)\b/i],
    ['external href/src or data URL', /(?:xlink:)?(?:href|src)\s*=\s*["']\s*(?:https?:|data:)/i],
    ['external CSS import', /@import\s+(?:url\s*\()?\s*["']?https?:/i],
    ['external CSS URL', /url\s*\(\s*["']?https?:/i],
  ];

  for (const [label, pattern] of checks) {
    if (pattern.test(svg)) problems.push(label);
  }

  return problems;
}

export function sanitizeSvg(svg, { title, description }) {
  if (!title?.trim() || !description?.trim()) {
    throw new Error('Both title and description are required.');
  }

  let output = svg
    .replace(/<!DOCTYPE(?:[^>]|\[[\s\S]*?\])*?>\s*/gi, '')
    .replace(
      /<switch>\s*<g\b[^>]*requiredFeatures=["']http:\/\/www\.w3\.org\/TR\/SVG11\/feature#Extensibility["'][^>]*\/>\s*<a\b[^>]*(?:xlink:)?href=["']https:\/\/www\.drawio\.com\/doc\/faq\/svg-export-text-problems["'][^>]*>[\s\S]*?<\/a>\s*<\/switch>\s*(?=<\/svg>)/gi,
      '',
    )
    .replace(/<title\b[^>]*id=["']diagram-title["'][^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<desc\b[^>]*id=["']diagram-description["'][^>]*>[\s\S]*?<\/desc>/gi, '');

  const openingMatch = output.match(/<svg\b[^>]*>/i);
  if (!openingMatch) throw new Error('SVG root element not found.');
  if (!/\bviewBox\s*=\s*["'][^"']+["']/i.test(openingMatch[0])) {
    throw new Error('SVG root must have a non-empty viewBox before sanitization.');
  }

  let openingTag = openingMatch[0];
  openingTag = removeAttribute(openingTag, 'role');
  openingTag = removeAttribute(openingTag, 'aria-labelledby');
  openingTag = openingTag.replace(
    /<svg\b/i,
    '<svg role="img" aria-labelledby="diagram-title diagram-description"',
  );

  output = output.replace(openingMatch[0], openingTag);
  output = output.replace(
    openingTag,
    `${openingTag}<title id="diagram-title">${escapeXml(title.trim())}</title><desc id="diagram-description">${escapeXml(description.trim())}</desc>`,
  );

  const withoutXlinkDeclaration = output.replace(/\sxmlns:xlink=["'][^"']+["']/i, '');
  if (!/xlink:/i.test(withoutXlinkDeclaration)) output = withoutXlinkDeclaration;

  const unsafe = findUnsafeSvgContent(output);
  if (unsafe.length > 0) {
    throw new Error(`Unsafe SVG content remains: ${unsafe.join(', ')}`);
  }
  if (!/<\/svg>\s*$/i.test(output)) throw new Error('Closing SVG element not found.');

  return output;
}

export function sanitizeSvgFile(filePath, options) {
  const original = fs.readFileSync(filePath, 'utf8');
  const sanitized = sanitizeSvg(original, options);
  const stat = fs.statSync(filePath);
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.sanitize-${process.pid}-${Date.now()}`,
  );

  try {
    fs.writeFileSync(temporaryPath, sanitized, { encoding: 'utf8', mode: stat.mode });
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
  return sanitized;
}

function parseArguments(argv) {
  const args = { file: null, title: null, description: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--title') args.title = argv[++index];
    else if (value === '--description') args.description = argv[++index];
    else if (!args.file) args.file = value;
    else throw new Error(`Unexpected argument: ${value}`);
  }
  if (!args.file || !args.title || !args.description) {
    throw new Error(
      'Usage: node sanitize-svg.js <file.svg> --title "Diagram title" --description "Diagram description"',
    );
  }
  return args;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const args = parseArguments(process.argv.slice(2));
    sanitizeSvgFile(args.file, args);
    console.log(`SANITIZED ${args.file}`);
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
