# Cognia Standard Preflight

> **Shared procedure.** Every Cognia agent must execute these steps before beginning analysis. They are listed here once to avoid repetition across agent definitions.

---

## Setup

Before starting analysis:

1. Record the repository root and the scope requested by the user.
2. Exclude generated and vendor directories (`node_modules`, `dist`, `build`, `.gradle`, `Pods`, `vendor`, `.next`, `__pycache__`, etc.) unless the user explicitly requests them.
3. Identify the detected platform(s) and state confidence (`Confirmed` / `Inferred`).
4. List key entry-point files identified for scanning.
5. Create the `cognia/` output directory before writing any output file.

If the repository root cannot be determined or is empty, stop and report: "Cannot run — repository root not found or empty."

---

## Context & Sampling Policy

Large repositories can exceed context limits. Apply this policy on every run:

**Scan order — prioritise high-signal files first:**
1. Entry points and main bootstraps (`main.*`, `index.*`, `app.*`, `server.*`)
2. Route registries and API surface files
3. Configuration and environment files (`*.config.*`, `.env.*`, `Dockerfile`, CI configs)
4. Security boundaries (auth middleware, permission guards, token handling)
5. Database models, schema files, and migration scripts
6. Test files (for coverage signal, not deep reading)
7. Feature modules and domain logic

**Sampling rules:**
- Build a file inventory (names + sizes) before deep-reading any file.
- For repositories with more than 200 files in scope, sample representatively rather than exhaustively — read at least one file per identified layer or module boundary.
- Never claim exhaustive coverage when only a sample was reviewed; state explicitly: `"Sampled N of M files in [layer/module]"`.
- Record which directories were skipped and why.
- If context limits force stopping early, complete the current section, record what was not reached, and note it in the report's Executive Summary.

---

## Report Finalisation

Every report must end with the following two sections, in this order.

### Handoff Notes (mandatory)

Record every material observation that belongs to another agent's domain. If there are no cross-domain observations, write `None.`

```markdown
## Handoff Notes

| Target Agent | Observation | Evidence | Reason For Handoff |
|---|---|---|---|
| `cognia-sec` | JWT secret stored in plaintext env var | `config/app.js:12` | Full vulnerability assessment required |
| `cognia-perf` | N+1 query pattern on user list endpoint | `services/user.service.ts:88` | Runtime impact measurement required |
```

Do not analyse the observation in depth — record it and move on. The target agent owns the full assessment.

### Validation Checklist (mandatory)

Before writing the output file, confirm:

- [ ] Every finding has a `Confirmed` / `Inferred` / `Static signal` / `Not found in scanned files` label.
- [ ] Every finding cites at least one file path (with line number or symbol name where available).
- [ ] All material findings use the Standard Finding Schema table format (defined in `core.md`).
- [ ] Output file(s) written to `cognia/` — not returned only in chat.
- [ ] No secret values printed in full.
- [ ] Handoff Notes section present (write `None.` if empty).
- [ ] No findings outside this agent's domain without a corresponding handoff note.
