#!/usr/bin/env bash
# new-skill.sh — Scaffold a new skill for the Cognia framework
#
# Usage:
#   bash scripts/new-skill.sh <skill-name>
#   bash scripts/new-skill.sh <skill-name> --tier2          # add STANDARDS.md (Tier-2 language skills)
#   bash scripts/new-skill.sh <skill-name> --phase <phase>  # set phase (default: advisory)
#
# Examples:
#   bash scripts/new-skill.sh cognia-graphql --phase 4b
#   bash scripts/new-skill.sh cognia-mobile --tier2 --phase 4e
#
# What it creates:
#   .github/skills/<name>/SKILL.md
#   .github/skills/<name>/STANDARDS.md    (--tier2 only)
#   .github/agents/<name>.agent.md
#   .claude/agents/<name>.md
#   .claude/skills/<name>/SKILL.md
#   .codex/skills/<name>/SKILL.md

set -euo pipefail

# ── Argument parsing ──────────────────────────────────────────────────────────
SKILL_NAME=""
TIER2=false
PHASE="advisory"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier2)    TIER2=true; shift ;;
    --phase)    PHASE="$2"; shift 2 ;;
    --*)        echo "Unknown option: $1"; exit 1 ;;
    *)
      if [[ -z "$SKILL_NAME" ]]; then
        SKILL_NAME="$1"
      else
        echo "Unexpected argument: $1"; exit 1
      fi
      shift ;;
  esac
done

if [[ -z "$SKILL_NAME" ]]; then
  echo "Usage: bash scripts/new-skill.sh <skill-name> [--tier2] [--phase <phase>]"
  exit 1
fi

# Validate name: lowercase letters, digits, hyphens only
if [[ ! "$SKILL_NAME" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]$ ]]; then
  echo "Error: skill name must be lowercase letters, digits, and hyphens (e.g. 'my-skill')."
  exit 1
fi

TODAY=$(date +%Y-%m-%d)
TIER=$( [[ "$TIER2" == true ]] && echo "2" || echo "1" )
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SKILL_DIR="$ROOT/.github/skills/$SKILL_NAME"
AGENT_FILE="$ROOT/.github/agents/$SKILL_NAME.agent.md"
CLAUDE_AGENT_FILE="$ROOT/.claude/agents/$SKILL_NAME.md"
CLAUDE_SKILL_DIR="$ROOT/.claude/skills/$SKILL_NAME"
CODEX_SKILL_DIR="$ROOT/.codex/skills/$SKILL_NAME"
CURSOR_AGENT_FILE="$ROOT/.cursor/agents/$SKILL_NAME.md"
CURSOR_RULE_FILE="$ROOT/.cursor/rules/$SKILL_NAME.mdc"

echo ""
echo "Scaffolding skill: $SKILL_NAME  (tier=$TIER, phase=$PHASE)"
echo "──────────────────────────────────────────────────────"

# Guard: abort if any target file already exists
for f in "$SKILL_DIR/SKILL.md" "$AGENT_FILE" "$CLAUDE_AGENT_FILE" "$CLAUDE_SKILL_DIR/SKILL.md" "$CODEX_SKILL_DIR/SKILL.md" "$CURSOR_AGENT_FILE" "$CURSOR_RULE_FILE"; do
  if [[ -e "$f" ]]; then
    echo "Error: '$f' already exists. Remove it or choose a different name."
    exit 1
  fi
done

mkdir -p "$SKILL_DIR" "$CLAUDE_SKILL_DIR" "$CODEX_SKILL_DIR" "$ROOT/.cursor/agents" "$ROOT/.cursor/rules"

# ── 1. .github/skills/<name>/SKILL.md ─────────────────────────────────────────
cat > "$SKILL_DIR/SKILL.md" << SKILL_EOF
---
name: $SKILL_NAME
description: 'TODO: one-line description. Use when: <trigger phrases>. Outputs: <key artifacts>. Requires: <prerequisites>.'
argument-hint: 'TODO: short description of the expected argument'
version: 1.0.0
last_reviewed: $TODAY
status: Active
---

# $(echo "$SKILL_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')

## Role
**TODO: Senior [Role Title]** — TODO: one-sentence description of what this agent does and why.

---

## Prerequisites (Preflight)

| Artifact | Path | Phase that produces it |
|---|---|---|
| TODO: prerequisite artifact | \`ai-driven-development/docs/.../TODO.md\` | Phase TODO |

> If any required artifact is missing, stop and report: "Cannot run $SKILL_NAME — [artifact] is required but not found."

---

## Output Location

Create folder \`ai-driven-development/TODO-output-dir/\` and produce:
- \`TODO_output_file.md\` — TODO: description

---

## Procedure

### Step 1 — TODO: Step Name
TODO: Describe what to do in this step.

---

### Step 2 — TODO: Step Name
TODO: Describe what to do in this step.

---

## Definition of Done

- [ ] TODO: DoD item 1
- [ ] TODO: DoD item 2
- [ ] TODO: DoD item 3

---

## Next Skill

After completing this phase, proceed to: [TODO: next-skill](../TODO-next-skill/SKILL.md)
SKILL_EOF

echo "  created  .github/skills/$SKILL_NAME/SKILL.md"

# ── 2. .github/skills/<name>/STANDARDS.md (Tier-2 only) ──────────────────────
if [[ "$TIER2" == true ]]; then
  cat > "$SKILL_DIR/STANDARDS.md" << STD_EOF
# TODO: Technology Name — Standards

> **Tier 2 (language-specific) — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards always take precedence; this file adds TODO-technology–specific rules only.

---

## Architecture Rules

- TODO: Rule 1 — brief rationale
- TODO: Rule 2 — brief rationale

---

## Banned Patterns

| Pattern | Reason | Replacement |
|---|---|---|
| TODO: banned pattern | TODO: reason | TODO: recommended alternative |

---

## Testing Standards

- TODO: Unit test conventions
- TODO: Integration test conventions

---

## Definition of Done (Language-Specific Additions)

In addition to the Tier-1 DoD in \`backend-development/SKILL.md\`, this stack requires:

- [ ] TODO: language-specific DoD item (e.g. \`./mvnw verify\` passes with zero errors)
- [ ] TODO: language-specific DoD item (e.g. linter / formatter clean)
STD_EOF
  echo "  created  .github/skills/$SKILL_NAME/STANDARDS.md"
fi

# ── 3. .github/agents/<name>.agent.md ────────────────────────────────────────
cat > "$AGENT_FILE" << AGENT_EOF
---
name: $SKILL_NAME
description: 'TODO: agent description matching SKILL.md description (keep in sync).'
argument-hint: 'TODO: matching SKILL.md argument-hint'
---

# $(echo "$SKILL_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1') Agent

## Role
**TODO: Senior [Role Title]** — TODO: one-sentence description.

## When to Use
- TODO: trigger condition 1
- TODO: trigger condition 2

---

## Skill Reference
This agent executes by strictly following every step defined in:

> [\`$SKILL_NAME\` skill](../skills/$SKILL_NAME/SKILL.md)

**Do NOT skip, reorder, or summarize steps.** Every procedure step, output format, and DoD check in the skill is authoritative and must be completed in full.

---

## Prerequisites

- TODO: prerequisite 1 (file path: \`ai-driven-development/docs/.../TODO.md\`)
- TODO: prerequisite 2

---

## Outputs

**Directory:** \`ai-driven-development/TODO-output-dir/\`

| File | Description |
|---|---|
| \`TODO_output_file.md\` | TODO: description |

---

## Definition of Done

<!-- IMPORTANT: Keep this section an exact copy of the DoD in SKILL.md -->

- [ ] TODO: DoD item 1
- [ ] TODO: DoD item 2
- [ ] TODO: DoD item 3
AGENT_EOF

echo "  created  .github/agents/$SKILL_NAME.agent.md"

# ── 4. .claude/agents/<name>.md ──────────────────────────────────────────────
cat > "$CLAUDE_AGENT_FILE" << CLAUDE_AGENT_EOF
---
name: $SKILL_NAME
description: "TODO: Claude Code agent description. Use when: <trigger phrases>. NOT for: <exclusions>. Requires: <prerequisites>."
tools:
  - Read
  - Write
  - Bash
  - WebSearch
  - Task
---
CLAUDE_AGENT_EOF

echo "  created  .claude/agents/$SKILL_NAME.md"

# ── 5. .claude/skills/<name>/SKILL.md ────────────────────────────────────────
cat > "$CLAUDE_SKILL_DIR/SKILL.md" << CLAUDE_SKILL_EOF
---
name: $SKILL_NAME
description: "TODO: runtime description — copy from SKILL.md, then expand with trigger phrases and outputs for the AI runtime. Run 'npm run sync:wrappers' after updating scripts/sync-wrappers.js."
argument-hint: TODO: matching SKILL.md argument-hint
---

# $SKILL_NAME
CLAUDE_SKILL_EOF

echo "  created  .claude/skills/$SKILL_NAME/SKILL.md"

# ── 6. .codex/skills/<name>/SKILL.md ─────────────────────────────────────────
cat > "$CODEX_SKILL_DIR/SKILL.md" << CODEX_SKILL_EOF
---
name: $SKILL_NAME
description: "TODO: runtime description — same as .claude/skills/$SKILL_NAME/SKILL.md."
argument-hint: TODO: matching SKILL.md argument-hint
---

# $SKILL_NAME
CODEX_SKILL_EOF

echo "  created  .codex/skills/$SKILL_NAME/SKILL.md"

# ── 7. .cursor/agents/<name>.md ──────────────────────────────────────────────
cat > "$CURSOR_AGENT_FILE" << CURSOR_AGENT_EOF
---
name: $SKILL_NAME
description: "TODO: agent description — same as .claude/agents/$SKILL_NAME.md."
---

> **Canonical definition**: Read \`.github/agents/$SKILL_NAME.agent.md\` and follow every instruction defined there exactly. This file exists only to register the agent — all role, responsibilities, constraints, approach, and output format are in the canonical file.
CURSOR_AGENT_EOF

echo "  created  .cursor/agents/$SKILL_NAME.md"

# ── 8. .cursor/rules/<name>.mdc ──────────────────────────────────────────────
cat > "$CURSOR_RULE_FILE" << CURSOR_RULE_EOF
---
description: "TODO: runtime description — same as .claude/agents/$SKILL_NAME.md."
globs:
alwaysApply: false
---

> **Canonical definition**: Read \`.github/agents/$SKILL_NAME.agent.md\` and follow every instruction defined there exactly. This file exists only to register the agent — all role, responsibilities, constraints, approach, and output format are in the canonical file.
CURSOR_RULE_EOF

echo "  created  .cursor/rules/$SKILL_NAME.mdc"

# ── Next steps ────────────────────────────────────────────────────────────────
echo ""
echo "✓ Scaffold complete. Next steps:"
echo ""
echo "  1. Fill in every TODO placeholder in the generated files."
echo "     Pay special attention to description and argument-hint in every SKILL.md —"
echo "     these fields are the single source of truth that sync-wrappers propagates."
echo ""
echo "  2. Add an entry to .github/roster.json:"
echo '     {'
echo "       \"name\": \"$SKILL_NAME\","
echo "       \"phase\": \"$PHASE\","
echo "       \"tier\": \"$TIER\","
echo "       \"skill_path\": \".github/skills/$SKILL_NAME/SKILL.md\","
echo "       \"agent_path\": \".github/agents/$SKILL_NAME.agent.md\","
echo "       \"installer\": true,"
echo '       "status": "active"'
echo '     }'
echo "     bin/install.js and check:wrappers read this file automatically."
echo "     No changes to those scripts are required."
echo ""
echo "  3. Propagate frontmatter to runtime wrappers:"
echo "       npm run sync:wrappers"
echo ""
echo "  4. Verify all wrappers are consistent:"
echo "       npm run check:wrappers   (must exit 0 before PR)"
echo ""
