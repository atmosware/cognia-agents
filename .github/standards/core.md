# Cognia Core Standards (Tier 1)

> **Tier 1 — Universal standards.** Every Cognia agent and skill must comply with these rules. Skill-local standards (Tier 2) may add domain-specific rules but may never contradict or weaken these.

---

## Evidence Rules

- Every material finding must cite at least one concrete file path.
- Where possible, include a line number or symbol/section name alongside the path.
- Tag every claim with one of the following confidence labels:
  - `Confirmed` — directly evidenced by file content or configuration.
  - `Inferred` — best-fit interpretation where direct evidence is absent but strongly implied.
  - `Not found in scanned files` — required evidence was searched for but not located; do not guess.
- Do not infer behaviour from file names alone; validate via code or config content.
- For issues that can only be verified at runtime (e.g. actual token expiry, TLS negotiation), state `Requires runtime verification` and specify the verification method.

---

## Standard Finding Schema

Use this table format for every material finding in a report. Consistent structure makes reports diffable, parseable by downstream agents, and unambiguous to reviewers.

```markdown
| Severity | Confidence | Finding | Evidence | Impact | Recommendation |
|---|---|---|---|---|---|
| High | Confirmed | JWT secret stored in env var | `config/app.js:12` | Token forgery if env is exposed | Move to a secrets manager; rotate immediately |
| Medium | Inferred | No rate limiting on login endpoint | `routes/auth.js:34` (no middleware found) | Brute-force risk | Add rate-limit middleware (e.g. express-rate-limit) |
```

**Field rules:**

| Field | Required | Allowed values / format |
|---|---|---|
| Severity | Yes | `Critical` / `High` / `Medium` / `Low` / `Informational` |
| Confidence | Yes | `Confirmed` / `Inferred` / `Static signal` / `Requires runtime verification` |
| Finding | Yes | One concise sentence describing the issue |
| Evidence | Yes | `` `path/to/file:line` `` — if no line number, use `` `path/to/file` `` + symbol or section name |
| Impact | Yes | Business or technical consequence if unaddressed |
| Recommendation | Yes | Concrete, actionable remediation step |

- If line numbers are unavailable, cite the nearest symbol, function, class, or section name: `` `src/auth/token.ts (verifyToken)` ``
- If evidence spans multiple files, list the primary file and note others in the Finding column.
- Never leave Evidence blank — if no file evidence exists, the finding must be tagged `Inferred` or `Not found in scanned files` and must not appear in the findings table.

---

## Output File Rules

- Writing the designated output file(s) is mandatory. The analysis is not complete until every required file is created.
- If a required output file does not exist, create it and write the full content.
- If a required output file already exists, replace the entire file content in one atomic operation; always overwrite, never append.
- Write only the designated output file(s). Preserve unrelated user changes. Do not modify source files unless the user explicitly asks for remediation.
- Do NOT return the report content in chat as a substitute for writing the file.
- All output files must be written under the `cognia/` directory using the naming pattern `cognia/{project_name}-<agent>-analysis.md` unless the agent's skill definition specifies otherwise.

---

## Safety Rules

- Do not perform destructive operations on the analysed project (no file deletion, no dependency changes, no schema migrations).
- Do not execute arbitrary code against a live system unless the agent definition explicitly permits it and the user has confirmed.
- If secrets are discovered during analysis, report the file path, variable or key name, and secret type only. Do not print full secret values. Show at most the first 4 and last 4 characters if needed for deduplication.
- Static analysis findings are evidence of risk patterns, not proof of exploitability. Label static-only findings as `Static signal` and distinguish them from `Measured` or `Runtime-verified` findings.

---

## Scope Boundary Rules

Each agent operates within a defined domain. When a material finding belongs to another agent's domain, do not analyse it in depth — record it in the **Handoff Notes** section and identify the target agent.

| Agent | Domain |
|---|---|
| `cognia-arch` | System design, component topology, service boundaries |
| `cognia-tech` | Code quality, tech debt, security-adjacent signals |
| `cognia-sec` | Full vulnerability assessment, exploitability, remediation |
| `cognia-backend` | Endpoint inventory, API contracts, data layer |
| `cognia-frontend` | Pages, components, state management, bundle |
| `cognia-ios` | iOS screens, navigation, Swift/ObjC patterns |
| `cognia-android` | Android screens, navigation, Kotlin/Java patterns |
| `cognia-perf` | Runtime bottlenecks, query performance, memory |
| `cognia-test` | Test coverage, test quality, missing test recommendations |
| `cognia-ux` | UI/UX design, accessibility, interaction patterns |
| `cognia-po` | Feature inventory, backlog, product requirements |
| `cognia-reverse` | Business domain, workflows, non-technical stakeholder report |

---

## Handoff Notes

Every agent report must end with a `## Handoff Notes` section. If there are no cross-domain observations, write `None.`

```markdown
## Handoff Notes

| Target Agent | Observation | Evidence | Reason For Handoff |
|---|---|---|---|
| `cognia-sec` | JWT secret stored in plaintext env var | `config/app.js:12` | Full vulnerability assessment required |
```

---

## Validation Checklist

Before finalising a report, verify:

- [ ] Every finding has a `Confirmed` / `Inferred` / `Not found` label.
- [ ] Every finding cites at least one file path (with line number or symbol name where available).
- [ ] All material findings use the Standard Finding Schema table format.
- [ ] Output file(s) written to `cognia/` — not returned only in chat.
- [ ] No secret values printed in full.
- [ ] Handoff Notes section present (even if empty).
- [ ] No findings outside the agent's defined domain without a handoff note.
