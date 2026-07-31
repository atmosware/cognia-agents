#!/usr/bin/env node

import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { sanitizeSvgFile } from './sanitize-svg.js';
import { validateDiagramSet } from './validate-diagram-set.js';

function asddFor(basename) {
  const sections = Array.from({ length: 22 }, (_, index) => `## ${index + 1}. Section ${index + 1}\nFilled.`).join('\n\n');
  return `${sections}\n\nDiagram: [draw.io source](diagrams/${basename}.drawio) · [SVG](diagrams/${basename}.svg) · [view](diagrams/${basename}.html)\n`;
}

function htmlFor(basename, view, evidence) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Fixture</title></head><body><main>
<h1>Fixture Architecture</h1><img src="./${basename}.svg" alt="Fixture architecture">
<a href="./${basename}.svg">SVG</a><a href="./${basename}.drawio">draw.io</a>
<h2>Purpose and scope</h2><dl><dt>Architecture view</dt><dd>${view}</dd><dt>Evidence basis</dt><dd>${evidence}</dd></dl>
<h2>Components</h2><table><tr><th>Client</th><td>Initiates work</td></tr><tr><th>Gateway</th><td>Routes work</td></tr></table>
<h2>Communication and relationships</h2><table><tr><th>Client → Gateway</th><td>HTTPS request</td></tr></table>
<h2>Critical operations</h2><article><h3>Submit work</h3><ol><li>Client calls Gateway.</li></ol><dl><dt>Consistency boundary</dt><dd>Single request.</dd><dt>Failure handling</dt><dd>Return an error.</dd><dt>Security</dt><dd>TLS.</dd><dt>Observability</dt><dd>Correlation ID.</dd></dl></article>
<h2>Constraints, decisions, and trade-offs</h2><ul><li>Fixture constraint.</li></ul>
</main></body></html>`;
}

function drawioFixture(slug) {
  return `<mxfile><diagram name="Fixture" id="${slug}"><mxGraphModel><root>
<mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="client" value="Client" vertex="1" parent="1"><mxGeometry x="10" y="10" width="100" height="50" as="geometry"/></mxCell>
<mxCell id="gateway" value="Gateway" vertex="1" parent="1"><mxGeometry x="160" y="10" width="100" height="50" as="geometry"/></mxCell>
<mxCell id="edge" edge="1" parent="1" source="client" target="gateway"><mxGeometry relative="1" as="geometry"/></mxCell>
</root></mxGraphModel></diagram></mxfile>`;
}

function unsafeSvgFixture() {
  return `<?xml version="1.0"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 100">
<rect x="10" y="10" width="100" height="50"/><text x="20" y="35">Client</text><rect x="160" y="10" width="100" height="50"/><text x="170" y="35">Gateway</text><path d="M110 35 L160 35"/>
<switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a xlink:href="https://www.drawio.com/doc/faq/svg-export-text-problems"><text>Text is not SVG - cannot display</text></a></switch></svg>`;
}

function buildScenario(root, project, view, evidence) {
  const slug = 'high-level-architecture';
  const basename = `${project}-${slug}`;
  const diagramDirectory = path.join(root, 'docs', 'asdd', 'diagrams');
  fs.mkdirSync(diagramDirectory, { recursive: true });
  const basePath = path.join(diagramDirectory, basename);
  fs.writeFileSync(`${basePath}.drawio`, drawioFixture(slug));
  fs.writeFileSync(`${basePath}.svg`, unsafeSvgFixture());
  fs.writeFileSync(`${basePath}.html`, htmlFor(basename, view, evidence));
  const asdd = asddFor(basename);
  fs.writeFileSync(path.join(root, 'docs', 'asdd', `${project}-asdd.md`), asdd);
  sanitizeSvgFile(`${basePath}.svg`, {
    title: `${project} architecture`,
    description: `${view} architecture fixture`,
  });
  sanitizeSvgFile(`${basePath}.svg`, {
    title: `${project} architecture`,
    description: `${view} architecture fixture`,
  });
  return { basePath, asdd };
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cognia-asdd-tools-'));
try {
  const greenfield = buildScenario(temporaryRoot, 'greenfield', 'Target', 'Greenfield: user-provided brief and interview');
  const existing = buildScenario(temporaryRoot, 'existing', 'Current', 'Existing system: confirmed from repository scan');

  assert.deepStrictEqual(validateDiagramSet(greenfield), []);
  assert.deepStrictEqual(validateDiagramSet(existing), []);
  assert.strictEqual((fs.readFileSync(`${greenfield.basePath}.svg`, 'utf8').match(/id="diagram-title"/g) || []).length, 1);
  assert.doesNotMatch(fs.readFileSync(`${greenfield.basePath}.svg`, 'utf8'), /xmlns:xlink/);
  assert.match(fs.readFileSync(`${greenfield.basePath}.html`, 'utf8'), /Architecture view<\/dt><dd>Target/);
  assert.match(fs.readFileSync(`${existing.basePath}.html`, 'utf8'), /Evidence basis<\/dt><dd>Existing system/);

  fs.appendFileSync(`${existing.basePath}.html`, '<script>alert(1)</script>');
  assert(validateDiagramSet(existing).some((problem) => problem.includes('active viewer content')));

  console.log('PASS greenfield target-mode fixture');
  console.log('PASS existing-system current-mode fixture');
  console.log('PASS unsafe HTML rejection fixture');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
