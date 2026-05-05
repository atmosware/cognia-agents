#!/usr/bin/env node
/**
 * check-docs.js — Verify that AGENTS.md and README.md are consistent
 * with the canonical agent roster in .github/roster.json.
 *
 * Checks:
 *   - Every active roster entry is mentioned in AGENTS.md
 *   - Every active roster entry is mentioned in README.md
 *
 * Usage:
 *   node scripts/check-docs.js         # report issues, exit 1 if any
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const roster = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.github', 'roster.json'), 'utf8'),
);

const activeAgents = roster.skills
  .filter(e => e.status === 'active')
  .map(e => e.name);

const agentsMd  = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
const readmeMd  = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

let issues = 0;

for (const name of activeAgents) {
  if (!agentsMd.includes(name)) {
    console.error(`MISSING in AGENTS.md  : ${name}`);
    issues++;
  }
  if (!readmeMd.includes(name)) {
    console.error(`MISSING in README.md  : ${name}`);
    issues++;
  }
}

console.log('');

if (issues === 0) {
  console.log(`OK  All ${activeAgents.length} active roster entries present in AGENTS.md and README.md.`);
  process.exit(0);
}

console.error(
  `FAIL  ${issues} inconsistency(ies) found. Update AGENTS.md and/or README.md to match .github/roster.json.`,
);
process.exit(1);
