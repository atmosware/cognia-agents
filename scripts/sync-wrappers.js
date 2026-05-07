#!/usr/bin/env node
/**
 * sync-wrappers.js — Sync .claude/skills/, .codex/skills/, and .claude/agents/
 * wrapper metadata from the canonical source-of-truth definitions in .github/.
 *
 * Usage:
 *   node scripts/sync-wrappers.js          # sync wrapper frontmatter fields
 *   node scripts/sync-wrappers.js --check  # validate only (exit 1 if drift detected)
 *
 * Add to package.json scripts:
 *   "sync:wrappers": "node scripts/sync-wrappers.js"
 *   "check:wrappers": "node scripts/sync-wrappers.js --check"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

function relativePath(filePath) {
  return path.relative(ROOT, filePath) || filePath;
}

function readFileIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : '';
}

function parseFrontmatterScalar(rawValue) {
  const trimmed = rawValue.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const quote = trimmed[0];
    const inner = trimmed.slice(1, -1);
    if (quote === '"') {
      try {
        return JSON.parse(trimmed);
      } catch {
        return inner.replace(/\\"/g, '"');
      }
    }

    return inner.replace(/''/g, "'");
  }

  return trimmed;
}

function readFrontmatterField(content, field) {
  const frontmatter = extractFrontmatter(content);
  const line = frontmatter
    .split('\n')
    .find((candidate) => candidate.startsWith(`${field}:`));

  if (!line) {
    return null;
  }

  return parseFrontmatterScalar(line.slice(field.length + 1));
}

function replaceFrontmatterField(content, field, newValue) {
  const serializedValue = JSON.stringify(newValue);
  const pattern = new RegExp(`^(${field}:\\s*).*$`, 'm');

  if (!pattern.test(content)) {
    throw new Error(`Field "${field}" not found in frontmatter.`);
  }

  return content.replace(pattern, `$1${serializedValue}`);
}

function loadRosterEntries() {
  const rosterPath = path.join(ROOT, '.github', 'roster.json');
  const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));

  return roster.skills.filter((entry) => entry.installer && entry.status === 'active');
}

function readCanonicalMetadata(entry, paths, requiredFields) {
  for (const relative of paths.filter(Boolean)) {
    const absolute = path.join(ROOT, relative);
    const content = readFileIfExists(absolute);

    if (!content) {
      continue;
    }

    const metadata = {};
    let complete = true;

    for (const field of requiredFields) {
      metadata[field] = readFrontmatterField(content, field);
      if (!metadata[field]) {
        complete = false;
      }
    }

    if (complete) {
      return {
        path: absolute,
        ...metadata,
      };
    }
  }

  return null;
}

function expectedWrapperTargets(entry) {
  const targets = [
    {
      kind: 'skill',
      path: path.join(ROOT, '.claude', 'skills', entry.name, 'SKILL.md'),
      fields: ['description', 'argument-hint'],
      canonical: readCanonicalMetadata(entry, [entry.skill_path, entry.agent_path], [
        'description',
        'argument-hint',
      ]),
    },
    {
      kind: 'skill',
      path: path.join(ROOT, '.codex', 'skills', entry.name, 'SKILL.md'),
      fields: ['description', 'argument-hint'],
      canonical: readCanonicalMetadata(entry, [entry.skill_path, entry.agent_path], [
        'description',
        'argument-hint',
      ]),
    },
  ];

  if (entry.agent_path) {
    targets.push({
      kind: 'agent',
      path: path.join(ROOT, '.claude', 'agents', `${entry.name}.md`),
      fields: ['description'],
      canonical: readCanonicalMetadata(entry, [entry.agent_path], ['description']),
    });
    targets.push({
      kind: 'rule',
      path: path.join(ROOT, '.cursor', 'rules', `${entry.name}.mdc`),
      fields: ['description'],
      canonical: readCanonicalMetadata(entry, [entry.agent_path], ['description']),
    });
  }

  return targets;
}

let checkedCount = 0;
let updateCount = 0;
let issueCount = 0;

for (const entry of loadRosterEntries()) {
  for (const target of expectedWrapperTargets(entry)) {
    const displayPath = relativePath(target.path);

    if (!target.canonical) {
      issueCount++;
      console.error(
        `ERROR  ${displayPath}\n  missing canonical metadata in ${[
          entry.skill_path,
          entry.agent_path,
        ]
          .filter(Boolean)
          .join(', ')}`,
      );
      continue;
    }

    const content = readFileIfExists(target.path);
    if (!content) {
      issueCount++;
      console.error(
        `MISSING ${displayPath}\n  expected ${target.kind} wrapper for active roster entry "${entry.name}"`,
      );
      continue;
    }

    checkedCount++;

    const driftedFields = target.fields.filter((field) => {
      const currentValue = readFrontmatterField(content, field);
      return currentValue !== target.canonical[field];
    });

    if (driftedFields.length === 0) {
      console.log(`OK     ${displayPath}`);
      continue;
    }

    issueCount++;

    if (checkOnly) {
      for (const field of driftedFields) {
        console.error(
          `DRIFT  ${displayPath}\n  ${field} mismatch (source: ${relativePath(target.canonical.path)})`,
        );
      }
      continue;
    }

    let updatedContent = content;
    for (const field of driftedFields) {
      updatedContent = replaceFrontmatterField(updatedContent, field, target.canonical[field]);
    }

    fs.writeFileSync(target.path, updatedContent, 'utf8');
    updateCount++;
    console.log(`SYNCED ${displayPath}`);
  }
}

console.log('');

if (checkOnly) {
  if (issueCount === 0) {
    console.log(`OK     ${checkedCount} wrapper files checked. All wrappers are in sync.`);
    process.exit(0);
  }

  console.error(
    `FAIL   ${issueCount} wrapper issue(s) detected across ${checkedCount} existing wrapper files. Run 'npm run sync:wrappers' after fixing missing wrappers.`,
  );
  process.exit(1);
}

console.log(
  `DONE   ${checkedCount} wrapper files checked, ${updateCount} file(s) updated, ${issueCount - updateCount} issue(s) still require manual follow-up.`,
);
