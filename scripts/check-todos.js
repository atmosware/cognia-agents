#!/usr/bin/env node
/**
 * check-todos.js — Verify no active agent or skill definition contains
 * unfilled scaffold placeholders (`TODO:` with a colon).
 *
 * Legitimate uses of the bare word "TODO" (e.g. "Catalogue TODOs, FIXMEs")
 * are not flagged. Only `TODO:` followed by fill-in text is a violation.
 *
 * Usage:
 *   node scripts/check-todos.js         # report violations, exit 1 if any
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SCAN_DIRS = [
  '.github/agents',
  '.github/skills',
  '.github/standards',
  '.claude/agents',
  '.claude/skills',
  '.codex/skills',
];

const TODO_PATTERN = /TODO:/;

function collectFiles(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const results = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

let violationCount = 0;

for (const dir of SCAN_DIRS) {
  for (const file of collectFiles(dir)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const hits = lines
      .map((line, i) => ({ line: line.trimEnd(), n: i + 1 }))
      .filter(({ line }) => TODO_PATTERN.test(line));

    if (hits.length > 0) {
      violationCount += hits.length;
      const rel = path.relative(ROOT, file);
      for (const { line, n } of hits) {
        console.error(`PLACEHOLDER  ${rel}:${n}\n             ${line.trim()}`);
      }
    }
  }
}

console.log('');

if (violationCount === 0) {
  console.log(`OK  No unfilled TODO: placeholders found in active definitions.`);
  process.exit(0);
}

console.error(
  `FAIL  ${violationCount} unfilled TODO: placeholder(s) found. Fill them in before committing.`,
);
process.exit(1);
