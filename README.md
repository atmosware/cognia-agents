# Cognia

A collection of specialised AI agents and skills for comprehensive project analysis — covering architecture, backend, frontend, iOS, Android, UX, technical quality, product ownership, performance, security, reverse engineering, and test engineering.

## Agents

Agents auto-detect the platform(s) present in a project (backend, frontend, iOS, Android, or mixed) and apply only the relevant analysis playbook(s). Every agent writes its findings to a mandatory output file in `cognia/`.

| Agent | Domain | Description |
|-------|--------|-------------|
| `cognia-android` | Android mobile | Full Android codebase audit: screens, components, networking, navigation, state management |
| `cognia-arch` | System architecture | Component map, data flow, service boundaries, scalability, and architectural risk assessment |
| `cognia-backend` | Backend / API | Endpoint inventory, service catalogue, integrations, database schema, auth, and background jobs |
| `cognia-frontend` | Frontend / Web | Page and route inventory, component catalogue, state management, API integration, and build config |
| `cognia-ios` | iOS mobile | Full iOS codebase audit: screens, components, networking, navigation, state management |
| `cognia-perf` | Performance analysis | Auto-detects platform(s) and audits for bottlenecks: slow queries, large bundles, blocking threads, memory issues — with a prioritised improvement roadmap |
| `cognia-po` | Product ownership | Feature inventory, user stories, requirements gaps, business value mapping, and backlog recommendations |
| `cognia-reverse` | Reverse engineering | Extracts business domain, user roles, workflows, business rules, and integrations from code — output written for business analysts and product owners |
| `cognia-sec` | Security analysis | Auto-detects platform(s) and audits for vulnerabilities: injection, broken auth, insecure storage, exposed secrets, dependency CVEs — with a CVSS-aligned remediation roadmap |
| `cognia-tech` | Technical quality | Code quality, tech debt, dependency audit, security signals, and test coverage gaps |
| `cognia-test` | Test engineering | Audits existing test coverage for correctness and quality, identifies missing unit/integration/e2e tests, and produces a prioritised test backlog with acceptance criteria |
| `cognia-ux` | UI/UX audit | Page inventory, user flow mapping, design consistency, accessibility audit (WCAG), and UX improvement recommendations |
| `cognia-ux-design` | UI/UX design | Produces wireframes, information architecture, design system, design tokens, component API contracts, and developer handoff artifacts for new or redesigned UIs |

## Skills

All 13 agents ship with runtime wrappers for Claude Code (`.claude/skills/`), Codex CLI (`.codex/skills/`), and Cursor (`.cursor/rules/`). Three agents additionally include deep procedure documents and standards under `.github/skills/`:

| Skill folder | Used by | Contents |
|---|---|---|
| `.github/skills/cognia-arch` | `cognia-arch` | Mermaid diagram procedure, HTML template, STANDARDS.md |
| `.github/skills/cognia-tech` | `cognia-tech` | Multi-step analysis procedure, scale decomposition, output format |
| `.github/skills/cognia-ux` | `cognia-ux-design` | Wireframe procedure, design system, WCAG compliance, handoff artifacts |

## Installation

Run the interactive installer via `npx` — no local install required:

```bash
npx cognia
```

The installer will ask:
- **Scope**: `Global` (recommended — available in all projects) or `Local` (current project only)
- **Runtime**: `All` (Claude Code + Codex CLI + Cursor), `Claude Code only`, `Codex CLI only`, or `Cursor only`

#### Non-interactive flags

```bash
npx cognia --global           # global install, all runtimes
npx cognia --local            # local install (current project only)
npx cognia --global --claude  # global, Claude Code only
npx cognia --global --codex   # global, Codex CLI only
npx cognia --global --cursor  # global, Cursor only
npx cognia --uninstall        # remove all installed files
```

#### Script shortcuts (if installed locally)

```bash
npm run install:global   # global install, all runtimes
npm run install:local    # local install
npm run uninstall        # remove
```

### What gets installed

| Location | Contents |
|----------|----------|
| `~/.copilot/agents/` or `.github/agents/` | 13 `.agent.md` canonical agent definitions |
| `~/.copilot/skills/` or `.github/skills/` | Deep skill procedures for `cognia-arch`, `cognia-tech`, and `cognia-ux-design` |
| `~/.copilot/standards/` or `.github/standards/` | Shared standards: `core.md` (evidence rules, output contracts, handoff format) and `preflight.md` (setup and context policy) |
| `~/.claude/agents/` | Claude Code agent wrappers (13 agents) |
| `~/.claude/skills/` | Claude Code skill wrappers (13 skills) |
| `~/.codex/skills/` | Codex CLI skill wrappers (13 skills) |
| `~/.cursor/rules/` | Cursor rule wrappers (13 `.mdc` files) |

For a **local** install, all paths above are relative to the project root (`.claude/`, `.codex/`, `.cursor/`, `.github/`) instead of `~/`.

## Usage

### GitHub Copilot

All agent definitions live in `.github/agents/*.agent.md`. Reference them in VS Code's agent mode or any Copilot-compatible tool:

```
@cognia-arch analyse the architecture of this service
@cognia-backend map all API endpoints
```

### Claude Code

Invoke agents with `/agent-name` or `@agent-name`:

```
/cognia-arch
@cognia-tech
/cognia-sec
```

### Cursor

After installing, Cursor's AI picks up the relevant agent rule automatically based on what you ask. You can also invoke agents explicitly:

```
Use cognia-arch to analyse the architecture of this project.
Run cognia-backend on the codebase and write the analysis.
```

Each agent rule is stored in `.cursor/rules/` (local) or `~/.cursor/rules/` (global) as a `.mdc` file. Cursor loads the rule into context when the request matches the rule's description.

### Codex CLI

```bash
$cognia-arch
$cognia-backend
```

## Cross-Agent Rules

1. **Evidence first** — every finding cites at least one concrete file path.
2. **Tag confidence** — claims are marked `Confirmed` (directly evidenced) or `Inferred` (best-fit interpretation).
3. **Missing evidence** — states `Not found in scanned files` rather than guessing.
4. **Output files are mandatory** — analysis is not complete until the designated output file is written.
5. **No domain creep** — each agent respects its scope; cross-domain observations belong in a handoff note.

## License

MIT
