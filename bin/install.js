#!/usr/bin/env node
// bin/install.js — Cognia installer
// Usage:
//   npx cognia               (interactive)
//   npx cognia --global      (global, all runtimes)
//   npx cognia --local       (current project)
//   npx cognia --uninstall   (remove)

import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const PKG_VERSION  = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')).version;

// Previous global installs used a private Claude cache. Keep this so uninstall
// can clean old package-owned definitions after the canonical location moves.
const LEGACY_GLOBAL_INSTALL_DIRNAME = 'cognia';

const AGENTS = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, '.github', 'roster.json'), 'utf8'))
  .skills
  .filter(entry => entry.installer && entry.status === 'active')
  .map(entry => entry.name);

const args = process.argv.slice(2);
const isUninstall = args.includes('--uninstall');
const isGlobal    = args.includes('--global') || args.includes('-g');
const isLocal     = args.includes('--local')  || args.includes('-l');
const claudeOnly  = args.includes('--claude');
const codexOnly   = args.includes('--codex');
const cursorOnly  = args.includes('--cursor');
const allRuntime  = args.includes('--all') || (!claudeOnly && !codexOnly && !cursorOnly);
const runtimes    = allRuntime
  ? ['claude', 'codex', 'cursor']
  : [...(claudeOnly ? ['claude'] : []), ...(codexOnly ? ['codex'] : []), ...(cursorOnly ? ['cursor'] : [])];

// ── helpers ──────────────────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function removeIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    return true;
  }
  return false;
}

function computeDirChecksum(dir) {
  if (!fs.existsSync(dir)) return '';
  const hash = crypto.createHash('sha256');
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === '.installed') continue;
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(p); } else { hash.update(entry.name); hash.update(fs.readFileSync(p)); }
    }
  }
  walk(dir);
  return hash.digest('hex').slice(0, 16);
}

function readInstalled(dir) {
  const f = path.join(dir, '.installed');
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}

function writeInstalled(dir, version, checksum) {
  const data = { version, checksum, installedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, '.installed'), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function removePackageDefinitions(skillsInstallDir, agentsInstallDir) {
  for (const agent of AGENTS) {
    const p = path.join(agentsInstallDir, `${agent}.agent.md`);
    if (removeIfExists(p)) console.log(`  ✓ removed agent : ${agent}`);
  }
  for (const agent of AGENTS) {
    const p = path.join(skillsInstallDir, agent);
    if (removeIfExists(p)) console.log(`  ✓ removed skill : ${agent}`);
  }
}

function removeInstalledDefinitions(scope, skillsInstallDir, agentsInstallDir, standardsInstallDir) {
  const installBase = path.dirname(skillsInstallDir);

  console.log('▶ Removing GitHub Copilot definitions...');
  removePackageDefinitions(skillsInstallDir, agentsInstallDir);
  if (removeIfExists(standardsInstallDir)) console.log(`  ✓ removed standards`);

  if (scope === 'global') {
    for (const base of [path.join(os.homedir(), '.copilot'), path.join(os.homedir(), '.github')]) {
      if (base !== installBase) {
        removePackageDefinitions(path.join(base, 'skills'), path.join(base, 'agents'));
        removeIfExists(path.join(base, 'standards'));
      }
    }

    const legacyInstallBase = path.join(os.homedir(), '.claude', LEGACY_GLOBAL_INSTALL_DIRNAME);
    if (legacyInstallBase !== installBase && removeIfExists(legacyInstallBase)) {
      console.log(`  ✓ removed legacy definitions: ${legacyInstallBase}`);
    }
  }
}

/**
 * Copy a file, replacing all occurrences of relative `.github/skills/` and
 * `.github/agents/` paths with the absolute paths where those files are installed.
 */
function copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir, standardsInstallDir) {
  let content = fs.readFileSync(src, 'utf8');
  content = content.replaceAll('.github/skills/', skillsInstallDir + '/');
  content = content.replaceAll('.github/agents/', agentsInstallDir + '/');
  content = content.replaceAll('.github/standards/', standardsInstallDir + '/');
  fs.writeFileSync(dest, content, 'utf8');
}

// ── resolve base dirs ─────────────────────────────────────────────────────────

function resolveCopilotBase(scope) {
  if (scope === 'local') return path.join(process.cwd(), '.github');

  const globalCopilotBase = path.join(os.homedir(), '.copilot');
  return fs.existsSync(globalCopilotBase)
    ? globalCopilotBase
    : path.join(os.homedir(), '.github');
}

function resolveBases(scope) {
  const claudeBase = process.env.CLAUDE_CONFIG_DIR
    ? process.env.CLAUDE_CONFIG_DIR
    : scope === 'global' ? path.join(os.homedir(), '.claude') : path.join(process.cwd(), '.claude');
  const codexBase = scope === 'global'
    ? path.join(os.homedir(), '.codex')
    : path.join(process.cwd(), '.codex');
  const cursorBase = process.env.CURSOR_CONFIG_DIR
    ? process.env.CURSOR_CONFIG_DIR
    : scope === 'global' ? path.join(os.homedir(), '.cursor') : path.join(process.cwd(), '.cursor');
  // Full skill and agent files are installed in the Copilot-visible source tree
  // so Claude, Codex, and Cursor wrappers can reference the same canonical files.
  const installBase      = resolveCopilotBase(scope);
  const skillsInstallDir    = path.join(installBase, 'skills');
  const agentsInstallDir    = path.join(installBase, 'agents');
  const standardsInstallDir = path.join(installBase, 'standards');
  return { claudeBase, codexBase, cursorBase, skillsInstallDir, agentsInstallDir, standardsInstallDir };
}

// ── install ───────────────────────────────────────────────────────────────────

function install(scope, selectedRuntimes) {
  const { claudeBase, codexBase, cursorBase, skillsInstallDir, agentsInstallDir, standardsInstallDir } = resolveBases(scope);

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Cognia — Installer');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Scope  : ${scope === 'global' ? `global` : `local (${process.cwd()})`}`);
  console.log(`  Runtime: ${selectedRuntimes.join(', ')}`);
  console.log('══════════════════════════════════════════════════════════');
  console.log('');

  // ── Step 1: Copy .github/skills/, .github/agents/, and .github/standards/ to stable install location
  console.log('▶ Installing shared standards...');
  const ghStandardsSrc = path.join(PACKAGE_ROOT, '.github', 'standards');
  if (fs.existsSync(ghStandardsSrc)) {
    copyDir(ghStandardsSrc, standardsInstallDir);
    console.log(`  ✓ standards/`);
    console.log(`  → ${standardsInstallDir}`);
  }
  console.log('');

  console.log('▶ Installing skill definitions...');
  const ghSkillsSrc = path.join(PACKAGE_ROOT, '.github', 'skills');
  for (const agent of AGENTS) {
    const src  = path.join(ghSkillsSrc, agent);
    const dest = path.join(skillsInstallDir, agent);
    if (!fs.existsSync(src)) continue;
    const newChecksum = computeDirChecksum(src);
    const existing    = readInstalled(dest);
    if (existing && existing.version === PKG_VERSION && existing.checksum === newChecksum) {
      console.log(`  ✓ skills/${agent} (up to date)`);
      continue;
    }
    if (existing && (existing.version !== PKG_VERSION || existing.checksum !== newChecksum)) {
      console.log(`  ⚠  skills/${agent}: drift detected — v${existing.version} → v${PKG_VERSION}, reinstalling`);
    }
    copyDir(src, dest);
    writeInstalled(dest, PKG_VERSION, newChecksum);
    console.log(`  ✓ skills/${agent}`);
  }
  console.log(`  → ${skillsInstallDir}`);

  console.log('');
  console.log('▶ Installing agent definitions...');
  const ghAgentsSrc = path.join(PACKAGE_ROOT, '.github', 'agents');
  for (const agent of AGENTS) {
    const src  = path.join(ghAgentsSrc, `${agent}.agent.md`);
    const dest = path.join(agentsInstallDir, `${agent}.agent.md`);
    if (fs.existsSync(src)) {
      fs.mkdirSync(agentsInstallDir, { recursive: true });
      copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir, standardsInstallDir);
      console.log(`  ✓ agents/${agent}.agent.md`);
    }
  }
  console.log(`  → ${agentsInstallDir}`);
  console.log('');

  // ── Step 2: Install per-runtime wrappers with patched absolute paths
  for (const runtime of selectedRuntimes) {
    if (runtime === 'claude') {
      console.log('▶ Installing Claude Code agents...');
      const agentSrc  = path.join(PACKAGE_ROOT, '.claude', 'agents');
      const agentDest = path.join(claudeBase, 'agents');
      fs.mkdirSync(agentDest, { recursive: true });
      for (const agent of AGENTS) {
        const src  = path.join(agentSrc, `${agent}.md`);
        const dest = path.join(agentDest, `${agent}.md`);
        if (fs.existsSync(src)) {
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir, standardsInstallDir);
          console.log(`  ✓ agent : ${agent}`);
        }
      }

      console.log('');
      console.log('▶ Installing Claude Code skills...');
      const skillSrc  = path.join(PACKAGE_ROOT, '.claude', 'skills');
      const skillDest = path.join(claudeBase, 'skills');
      for (const agent of AGENTS) {
        const src  = path.join(skillSrc, agent, 'SKILL.md');
        const dest = path.join(skillDest, agent, 'SKILL.md');
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir, standardsInstallDir);
          console.log(`  ✓ skill : ${agent}`);
        }
      }

      console.log('');
      console.log(`  Claude Code → ${claudeBase}`);
      console.log('  Usage: /cognia-arch  or  @cognia-tech');
    }

    if (runtime === 'codex') {
      console.log('▶ Installing Codex skills...');
      const skillSrc  = path.join(PACKAGE_ROOT, '.codex', 'skills');
      const skillDest = path.join(codexBase, 'skills');
      for (const agent of AGENTS) {
        const src  = path.join(skillSrc, agent, 'SKILL.md');
        const dest = path.join(skillDest, agent, 'SKILL.md');
        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir, standardsInstallDir);
          console.log(`  ✓ skill : ${agent}`);
        }
      }

      console.log('');
      console.log(`  Codex CLI → ${codexBase}`);
      console.log('  Usage: $legacy-analysis');
    }

    if (runtime === 'cursor') {
      console.log('▶ Installing Cursor rules...');
      const ruleSrc  = path.join(PACKAGE_ROOT, '.cursor', 'rules');
      const ruleDest = path.join(cursorBase, 'rules');
      fs.mkdirSync(ruleDest, { recursive: true });
      for (const agent of AGENTS) {
        const src  = path.join(ruleSrc, `${agent}.mdc`);
        const dest = path.join(ruleDest, `${agent}.mdc`);
        if (fs.existsSync(src)) {
          copyWithPatchedPaths(src, dest, skillsInstallDir, agentsInstallDir, standardsInstallDir);
          console.log(`  ✓ rule  : ${agent}`);
        }
      }

      console.log('');
      console.log(`  Cursor → ${cursorBase}`);
      console.log('  Usage: Ask the AI to run cognia-arch / cognia-backend / etc.');
    }

    console.log('');
  }

  console.log('══════════════════════════════════════════════════════════');
  console.log('  Installation complete!');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');
}

// ── uninstall ─────────────────────────────────────────────────────────────────

function uninstall(scope, selectedRuntimes) {
  const { claudeBase, codexBase, cursorBase, skillsInstallDir, agentsInstallDir, standardsInstallDir } = resolveBases(scope);

  console.log('');
  console.log('══════════════════════════════════════════════════════════');
  console.log('  Cognia — Uninstaller');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');

  removeInstalledDefinitions(scope, skillsInstallDir, agentsInstallDir, standardsInstallDir);
  console.log('');

  for (const runtime of selectedRuntimes) {
    if (runtime === 'claude') {
      console.log('▶ Removing Claude Code agents...');
      for (const agent of AGENTS) {
        const p = path.join(claudeBase, 'agents', `${agent}.md`);
        if (removeIfExists(p)) console.log(`  ✓ removed agent : ${agent}`);
      }
      console.log('▶ Removing Claude Code skills...');
      for (const agent of AGENTS) {
        const p = path.join(claudeBase, 'skills', agent);
        if (removeIfExists(p)) console.log(`  ✓ removed skill : ${agent}`);
      }
    }

    if (runtime === 'codex') {
      console.log('▶ Removing Codex skills...');
      for (const agent of AGENTS) {
        const p = path.join(codexBase, 'skills', agent);
        if (removeIfExists(p)) console.log(`  ✓ removed skill : ${agent}`);
      }
    }

    if (runtime === 'cursor') {
      console.log('▶ Removing Cursor rules...');
      for (const agent of AGENTS) {
        const p = path.join(cursorBase, 'rules', `${agent}.mdc`);
        if (removeIfExists(p)) console.log(`  ✓ removed rule  : ${agent}`);
      }
    }

    console.log('');
  }

  console.log('  Uninstall complete.');
  console.log('══════════════════════════════════════════════════════════');
  console.log('');
}

// ── interactive prompt ────────────────────────────────────────────────────────

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('');
  console.log('  Cognia');
  console.log('');

  const scopeAnswer = await ask(rl, '  Install where?\n  [1] Global — available in all projects (recommended)\n  [2] Local  — current project only\n  > ');
  const scope = scopeAnswer === '2' ? 'local' : 'global';

  const runtimeAnswer = await ask(rl, '\n  Install for which runtimes?\n  [1] All (Claude Code + Codex CLI + Cursor) (recommended)\n  [2] Claude Code only\n  [3] Codex CLI only\n  [4] Cursor only\n  > ');
  const selected = runtimeAnswer === '2' ? ['claude']
    : runtimeAnswer === '3' ? ['codex']
    : runtimeAnswer === '4' ? ['cursor']
    : ['claude', 'codex', 'cursor'];

  rl.close();
  install(scope, selected);
}

function ciInstall() {
  console.log('');
  console.log('  Cognia');
  console.log('  Non-interactive environment detected — using defaults: global, all runtimes.');
  console.log('  Override with: --local, --claude, --codex, or --cursor flags.');
  console.log('');
  install('global', ['claude', 'codex', 'cursor']);
}

// ── entry point ───────────────────────────────────────────────────────────────

const hasFlags = isGlobal || isLocal || claudeOnly || codexOnly || args.includes('--all');

if (isUninstall) {
  const scope = isLocal ? 'local' : 'global';
  uninstall(scope, runtimes);
} else if (hasFlags) {
  const scope = isLocal ? 'local' : 'global';
  install(scope, runtimes);
} else if (!process.stdin.isTTY) {
  ciInstall();
} else {
  interactive();
}
