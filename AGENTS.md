# Cognia — Agent Roster

> **Single source of truth**: All agent definitions live in `.github/agents/*.agent.md`.
> This file is the discovery index for OpenAI Codex. Before executing any agent task, read the
> corresponding `.github/agents/<name>.agent.md` file and follow every instruction defined there.

---

## Agent Index

| Agent | Canonical Definition | Domain | Trigger |
|-------|---------------------|--------|---------|
| cognia-android | `.github/agents/cognia-android.agent.md` | Android mobile | Android codebase audit |
| cognia-arch | `.github/agents/cognia-arch.agent.md` | System architecture | Architecture & design analysis |
| cognia-perf | `.github/agents/cognia-perf.agent.md` | Performance analysis | Performance bottleneck & improvement audit |
| cognia-reverse | `.github/agents/cognia-reverse.agent.md` | Reverse engineering | Business domain & workflow extraction for BA/PO audiences |
| cognia-test | `.github/agents/cognia-test.agent.md` | Test engineering | Coverage audit, missing test identification & test backlog |
| cognia-sec | `.github/agents/cognia-sec.agent.md` | Security analysis | Vulnerability audit & remediation recommendations |
| cognia-backend | `.github/agents/cognia-backend.agent.md` | Backend / API | Backend & API audit |
| cognia-frontend | `.github/agents/cognia-frontend.agent.md` | Frontend / Web | Frontend & web audit |
| cognia-ios | `.github/agents/cognia-ios.agent.md` | iOS mobile | iOS codebase audit |
| cognia-po | `.github/agents/cognia-po.agent.md` | Product ownership | Product & feature analysis |
| cognia-tech | `.github/agents/cognia-tech.agent.md` | Technical quality | Code quality & tech debt |
| cognia-ux | `.github/agents/cognia-ux.agent.md` | UI/UX audit | UX & accessibility audit of existing UI |
| cognia-ux-design | `.github/agents/cognia-ux-design.agent.md` | UI/UX design | Wireframes, design system, tokens & developer handoff for new or redesigned UIs |

---

## How to Use

When a task matches one of the agents above:

1. Read the canonical `.github/agents/<name>.agent.md` file.
2. Follow every instruction — role, responsibilities, constraints, approach, output format — exactly as written there.
3. Do not skip, reorder, or summarise any steps.

---

## Cross-Agent Rules

1. **Evidence first**: Every material finding must cite at least one concrete file path.
2. **Tag confidence**: Mark claims as `Confirmed` (directly evidenced) or `Inferred` (best-fit interpretation).
3. **Missing evidence**: State `Not found in scanned files` rather than guessing.
4. **Output files are mandatory**: The analysis is not complete until the designated output file is written. Do NOT return the full report in chat as a substitute.
5. **No domain creep**: Respect each agent's scope boundaries; cross-domain observations belong in a handoff note, not the report body.
