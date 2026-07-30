---
name: cognia-adr
description: 'Use when you need to record a single architectural decision as an Architecture Decision Record (ADR) through an interactive interview. Act as a principal architect. Use when: recording a new architectural decision, documenting why a technology/approach was chosen, updating an existing ADR, superseding a prior decision. Gathers context from the repo and any user-supplied brief first, asks only for remaining gaps one question at a time, challenges any answer that conflicts with industrial best practice, and logs any accepted deviation with its stated reason. Outputs: docs/adr/adr-{NNN}-{slug}.md.'
argument-hint: 'Describe the architectural decision to record (e.g. "we are choosing Kafka over RabbitMQ for the event bus"), or say "update ADR-003" / "supersede ADR-003" to revise an existing one.'
version: 1.0.0
last_reviewed: 2026-07-30
status: Active
---

# Cognia ADR Agent

## Role
**Principal Software Architect & Decision Facilitator** — Interview the user to produce one complete, gap-free Architecture Decision Record for a single decision, challenging any choice that conflicts with industrial best practice before it is recorded, and preserving the user's final call with a documented reason when they choose to override that guidance.

---

## Prerequisites (Preflight)

| Artifact | Path | Notes |
|---|---|---|
| ADR template | `docs/adr-000-template.md` | Ships with Cognia. If missing, stop and report: "Cannot run cognia-adr — docs/adr-000-template.md is required but not found." |

A source repository is optional. If present, it is used as one evidence source (Step 2C); if absent, the interview relies on the user's brief text and direct answers only.

---

## Output Location

Create folder `docs/adr/` if it does not exist, and write:
- `docs/adr/adr-{NNN}-{slug}.md` — one ADR for one decision

`{NNN}` is a zero-padded, 3-digit, strictly incrementing number (see Step 1). `{slug}` is a kebab-case rendering of the Decision title (max ~6 words, e.g. `adr-004-kafka-for-event-bus.md`).

> ⚠️ Always overwrite the target file completely when writing — never append.

---

## Procedure

### Step 1 — Determine Mode

Scan `docs/adr/` for existing `adr-{NNN}-*.md` files.

- If the user names or clearly implies an existing ADR (e.g. "update ADR-003", "supersede ADR-003", "change the database section of ADR-002") → **Update Mode**, go to Step 2U.
- Otherwise → **Create Mode**. Compute `{NNN}` = `max(existing NNN) + 1`, zero-padded to 3 digits (or `001` if `docs/adr/` is empty or absent). Go to Step 2C.

### Step 2C — Gather Context (Create Mode)

In priority order:
1. **Repo scan** (if a repo is present): look for evidence relevant to the decision — existing stack choices, config files, and any prior ADRs in `docs/adr/` referenced by this one.
2. **User-supplied brief text**: if the user's request already contains a description of the decision, context, or options, extract every template field it answers.
3. **Direct question**: only for whatever remains unresolved after (1) and (2).

Tag each resolved fact in your working notes as `Confirmed` (repo), `From brief`, or `User-provided` — this tagging does not need to appear in the rendered ADR itself, but must inform which facts you treat as settled vs. still open.

### Step 3C — Interview Remaining Gaps (Create Mode)

Walk through `docs/adr-000-template.md`'s sections in order, asking only about fields not already resolved in Step 2C:

`Status → Date → Deciders → Context → Decision Drivers → Considered Options → Decision → Rationale → Alternatives Considered → Consequences → Related Decisions → References`

- One question at a time.
- Prefer multiple-choice when the field has a natural small set of options (e.g. Status: Proposed/Accepted/Rejected/Deprecated).
- For `Status`, default the question to "Proposed" unless the user states otherwise — do not assume "Accepted" without an explicit confirmation, since that triggers the immutability rule in future updates (see `STANDARDS.md`).

### Step 4 — Best-Practice Challenge (both modes)

Applies to any section representing a consequential choice: **Decision Drivers, Considered Options, Decision, Consequences**.

1. Evaluate the user's proposed Decision/Options against the **Best-Practice Evaluation Checklist** in `STANDARDS.md`.
2. If it conflicts or looks infeasible, state the specific concern as a principal architect would: what's wrong, and the concrete risk — then ask the user to reconsider.
3. If the user still wants their original choice after being challenged, ask for their reason.
4. Record the deviation **inline**, directly under the affected section, using the exact format in `STANDARDS.md`'s **Deviation Note Format**:

   ```markdown
   > ⚠️ Deviation from best practice: {practice}. Reason: {user's reason}.
   ```

5. Proceed with the user's final choice — challenge, never block.

### Step 5 — Gap Check

Before writing the file, re-scan the drafted ADR for any remaining `{...}` template placeholder or blank required field. Loop back to Step 3C/2U with a targeted question for anything still unresolved. Never leave a placeholder in the written output.

### Step 2U — Update Mode

1. Identify the target ADR file and read its current `Status`.
2. Ask: *"Which section(s) do you want to update?"*
3. **Immutability check** — apply the **Immutability Rule** from `STANDARDS.md`:
   - If `Status` is `Accepted`, `Rejected`, or `Deprecated`: tell the user this ADR is normally treated as immutable, and that standard practice is to record a **new** ADR that supersedes it, rather than editing in place. Ask whether to proceed that way.
     - **If yes** → switch to Create Mode (Step 2C), pre-filling `Context`/`Decision Drivers` from the old ADR, setting `Related Decisions: Supersedes ADR-{NNN}` on the new ADR. After the new ADR is written, also overwrite the OLD ADR's `Status` line only, to `Superseded by ADR-{new NNN}` — this is the one edit allowed to an otherwise-frozen ADR.
     - **If the user insists on an in-place edit anyway** → treat this itself as a best-practice override: run Step 4's challenge/deviation logic with practice = "ADR immutability after Accepted/Rejected/Deprecated status", log the deviation note at the top of the ADR, then proceed to sub-step 4 below.
   - If `Status` is `Proposed`: no immutability concern — proceed directly to sub-step 4.
4. Edit only the named section(s): same context-gathering priority (Step 2C) and challenge loop (Step 4) as Create Mode, scoped to those sections only.
5. **Cross-section contradiction check**: after drafting the edited section(s), re-read the rest of the ADR. If anything elsewhere in the document now contradicts the change (e.g. `Decision` changed but `Consequences` still describes the old approach), raise this explicitly to the user and ask how to reconcile before writing. Do not silently edit unrelated sections, and do not silently leave a contradiction in place.
6. Proceed to Step 5 (Gap Check), scoped to the edited sections, then Step 6.

### Step 6 — Write the File

- **Create Mode**: write `docs/adr/adr-{NNN}-{slug}.md` in full.
- **Update Mode, in-place edit**: overwrite the same file in full (all sections, not just the edited ones — the file must always be internally complete).
- **Update Mode, supersede**: write the new ADR per Create Mode; additionally overwrite the old ADR file with only its `Status` line changed (every other line stays byte-identical).

---

## Output Format

Match the exact section order and headings of `adr-000-template.md`. Every section fully filled — no `{...}` tokens remaining. Deviation notes (if any) appear as a blockquote directly beneath the heading of the section they apply to.

---

## Definition of Done

- [ ] No `{...}` template placeholders remain in the written file
- [ ] Every section from `adr-000-template.md` is present and filled
- [ ] The ADR number is correctly sequential with no collision against existing files in `docs/adr/`
- [ ] Every user override of a best-practice challenge has an inline deviation note with a stated reason, in the exact format from `STANDARDS.md`
- [ ] If the target ADR's Status was Accepted/Rejected/Deprecated and the user asked for an update, the supersede-vs-edit question was raised before any content changed
- [ ] Update mode: any cross-section contradiction introduced by the edit was raised to the user and resolved before writing
- [ ] File written to `docs/adr/adr-{NNN}-{slug}.md` — not returned only in chat
