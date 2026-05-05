# Contributing to Cognia

Thank you for contributing. This document covers everything you need to add, edit, validate, or deprecate agents and skills in the framework.

---

## Prerequisites

- **Node.js ≥ 18** (for the installer and validator scripts)
- **bash** (for the skill scaffold generator)
- Git — clone the repo and work on a feature branch

```bash
git clone https://github.com/atmosware/cognia-agents.git
cd cognia-agents
```

---

## Repository Layout

```
.github/
  agents/     ← Canonical agent definitions (*.agent.md) — one per agent
  skills/     ← Deep skill procedures (**/SKILL.md, **/STANDARDS.md)
              ← Currently: cognia-arch, cognia-tech, cognia-ux-design
  standards/  ← Shared cross-cutting standards
                  core.md      — evidence rules, output contracts, finding schema, handoff format
                  preflight.md — standard setup and context/sampling policy
  roster.json ← Single source of truth for all agents

.claude/agents/    ← Claude Code agent wrappers (frontmatter + canonical reference)
.claude/skills/    ← Claude Code skill wrappers (frontmatter + canonical reference)
.codex/skills/     ← Codex CLI skill wrappers (frontmatter + canonical reference)

bin/install.js     ← npm package installer (reads roster.json — no manual AGENTS list)
scripts/           ← Developer tooling
```

---

## Running Validators

Always run all three validators before opening a PR:

```bash
# Check that runtime wrapper descriptions/hints match canonical definitions
npm run check:wrappers   # exit 0 = in sync, exit 1 = drift detected

# Check that no active definition contains unfilled TODO: placeholders
npm run check:todos      # exit 0 = clean, exit 1 = placeholders found

# Check that AGENTS.md and README.md are consistent with roster.json
npm run check:docs       # exit 0 = consistent, exit 1 = missing entries
```

Or run all three at once:

```bash
npm run check:wrappers && npm run check:todos && npm run check:docs
```

Fix any reported failures **before** pushing. The PR checklist (below) requires all three to pass.

---

## Adding a New Agent

### 1 — Scaffold the files

Use the generator script — it creates all required stubs and prints the registration steps:

```bash
bash scripts/new-skill.sh <agent-name>              # Tier-1 (self-contained agent, no skill folder)
bash scripts/new-skill.sh <agent-name> --tier2      # Tier-2 (adds deep .github/skills/ procedure)
```

`<agent-name>` must be lowercase with hyphens and start with `cognia-` (e.g. `cognia-graphql`, `cognia-mobile`).

The script creates:
- `.github/skills/<agent-name>/SKILL.md` — deep skill procedure stub (Tier-2 only)
- `.github/skills/<agent-name>/STANDARDS.md` — technology-specific standards (Tier-2 `--tier2` only)
- `.github/agents/<agent-name>.agent.md` — canonical agent definition stub
- `.claude/agents/<agent-name>.md` — Claude Code agent wrapper
- `.claude/skills/<agent-name>/SKILL.md` — Claude Code skill wrapper
- `.codex/skills/<agent-name>/SKILL.md` — Codex CLI skill wrapper

### 2 — Fill in the stubs

Open each generated file and replace every `TODO:` placeholder:

| File | Key sections to fill |
|---|---|
| `.github/agents/<name>.agent.md` | `description`, `argument-hint`, Role, When to Use, Core Responsibilities, Constraints, Evidence Rules, Approach, Output File |
| `.github/skills/<name>/SKILL.md` | `description`, `argument-hint`, Role, Procedure steps, Output Location, Definition of Done *(Tier-2 only)* |
| `.github/skills/<name>/STANDARDS.md` | Architecture rules, banned patterns, testing standards *(Tier-2 `--tier2` only)* |

**Required frontmatter fields for every `SKILL.md`:**

```yaml
name: cognia-<name>
description: 'Use when you need...'
argument-hint: 'Describe...'
version: 1.0.0
last_reviewed: YYYY-MM-DD
status: Active
```

All agent definitions must comply with the shared standards in:
- [`.github/standards/core.md`](.github/standards/core.md) — evidence rules, output contracts, finding schema, handoff notes
- [`.github/standards/preflight.md`](.github/standards/preflight.md) — setup procedure and context/sampling policy

### 3 — Register the agent

Add an entry to **`.github/roster.json`**:

```json
{
  "name": "cognia-<name>",
  "phase": "advisory",
  "tier": "1",
  "agent_path": ".github/agents/cognia-<name>.agent.md",
  "outputs": ["cognia/{project_name}-<name>-analysis.md"],
  "installer": true,
  "status": "active"
}
```

For Tier-2 agents, add `skill_path` as well:

```json
{
  "name": "cognia-<name>",
  "phase": "advisory",
  "tier": "2",
  "skill_path": ".github/skills/cognia-<name>/SKILL.md",
  "agent_path": ".github/agents/cognia-<name>.agent.md",
  "outputs": ["cognia/{project_name}-<name>-analysis.md"],
  "installer": true,
  "status": "active"
}
```

`bin/install.js` and `check:wrappers` read the roster automatically — no other scripts need editing.

### 4 — Sync and validate

```bash
npm run sync:wrappers    # propagate description/argument-hint from canonical → wrappers
npm run check:wrappers   # must exit 0
npm run check:todos      # must exit 0
npm run check:docs       # must exit 0
```

### 5 — Update documentation

Add the new agent to:
- `AGENTS.md` — agent index table
- `README.md` — agents table and (if Tier-2) skills table

`npm run check:docs` will tell you exactly which entries are missing.

---

## Editing an Existing Agent

1. Edit the canonical file: `.github/agents/<name>.agent.md` (and `.github/skills/<name>/SKILL.md` if it exists).
2. If `description` or `argument-hint` changed, run `npm run sync:wrappers` to propagate to all runtime wrappers.
3. Bump `version` and update `last_reviewed` in the frontmatter of any edited `SKILL.md`.
4. Run all three validators — exit 0 required for all before PR.

---

## Deprecating an Agent

1. Set `"status": "deprecated"` in `.github/roster.json` for the entry.
2. Add a deprecation notice to the top of the `.github/agents/<name>.agent.md` body.
3. Update `AGENTS.md` and `README.md` to remove or mark the entry.
4. Run `npm run check:docs` to confirm consistency.

Deprecated agents are excluded from installation and wrapper validation automatically (both scripts filter on `status === "active"`).

---

## Commit Conventions

Use conventional commit format:

| Type | Use for |
|---|---|
| `feat` | New agent, new script, new section in an agent definition |
| `fix` | Bug fix in a procedure, wrong output path, broken validator |
| `docs` | README, CONTRIBUTING, AGENTS.md, comment-only changes |
| `refactor` | Restructuring an existing agent without changing behaviour |
| `chore` | Dependency updates, version bumps, config changes |

Examples:

```
feat: add cognia-graphql agent (Tier-1 advisory)
fix: cognia-po output path aligned with roster.json outputs field
docs: update README agent count to 13
chore: bump version to 1.2.0
```

---

## PR Checklist

Before requesting review, confirm all of these:

- [ ] `npm run check:wrappers` exits 0
- [ ] `npm run check:todos` exits 0
- [ ] `npm run check:docs` exits 0
- [ ] New agent registered in `.github/roster.json` with `installer: true` and `status: "active"`
- [ ] All `TODO:` placeholders replaced in every generated file
- [ ] `description` and `argument-hint` are filled and accurately describe the agent's trigger and outputs
- [ ] New agent appears in `AGENTS.md` and `README.md`
- [ ] `version` and `last_reviewed` bumped on every edited `SKILL.md`
- [ ] Output file path in agent definition matches the `outputs` field in `roster.json`
