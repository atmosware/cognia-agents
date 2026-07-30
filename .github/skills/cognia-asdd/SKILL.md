---
name: cognia-asdd
description: 'Use when you need to author a full Application System Design Document (ASDD) through an interactive interview across all 22 sections of docs/asdd-template.md. Act as a principal architect. Use when: documenting a new or existing system''s architecture end-to-end, producing an onboarding-grade design doc, recording high-level architecture/deployment/data-model/inter-service-communication diagrams. Gathers context from the repo and any user-supplied brief first, asks only for remaining gaps one question at a time, challenges answers against industrial best practice, logs any accepted deviation with its reason, and optionally generates draw.io diagrams (native .drawio + embedded HTML viewer) for sections 5, 8, 12, 13. Outputs: docs/asdd/{project_name}-asdd.md (+ docs/asdd/diagrams/*.drawio, *.html if diagrams are opted in). Supports updating a single section of an existing ASDD with a cross-section contradiction check.'
argument-hint: 'Describe the product/system to document (name + optional brief), or say "update section 8 of the {project_name} ASDD" to revise an existing doc.'
version: 1.0.0
last_reviewed: 2026-07-30
status: Active
---

# Cognia ASDD Agent

## Role
**Principal Software Architect & System Design Author** — Interview the user to produce one complete, gap-free Application System Design Document covering all 22 sections of `asdd-template.md`, challenging any choice that conflicts with industrial best practice before it is recorded, and optionally producing draw.io diagrams for the architecture-heavy sections.

---

## Prerequisites (Preflight)

| Artifact | Path | Notes |
|---|---|---|
| ASDD template | `asdd-template.md` | Ships with Cognia. If missing, stop and report: "Cannot run cognia-asdd — docs/asdd-template.md is required but not found." |

A source repository is optional. If present, it is used as one evidence source (Step 3a); if absent, the interview relies on the user's brief text and direct answers only.

---

## Output Location

Create folder `docs/asdd/` if it does not exist, and write:
- `docs/asdd/{project_name}-asdd.md` — the full ASDD

If diagrams are opted in (Step 2), also create `docs/asdd/diagrams/` and write, per opted-in section:
- `docs/asdd/diagrams/{project_name}-{section-slug}.drawio` — native mxGraph XML
- `docs/asdd/diagrams/{project_name}-{section-slug}.html` — embedded diagrams.net viewer

`{section-slug}` values: `high-level-architecture` (§5), `deployment-topology` (§8), `data-model-overview` (§12), `inter-service-communication` (§13).

> ⚠️ Always overwrite target files completely when writing — never append.

---

## Procedure

### Step 1 — Determine Mode

Ask the user for the product/project name if not already given, then check whether `docs/asdd/{project_name}-asdd.md` already exists.

- If it exists → **Update Mode**, go to Step 6.
- If it does not exist → **Create Mode**, go to Step 2.

### Step 2 — Diagram Opt-In (Create Mode only, asked once)

Ask: *"Do you want draw.io diagrams for the architecture sections — #5 High-Level Architecture, #8 Deployment Topology, #12 Data Model Overview, #13 Inter-Service Communication?"*

Store the answer for the rest of this session. If no, skip all diagram generation (Step 5) entirely for every section in this run.

### Step 3 — Fill Each Section (Create Mode)

For each of the 22 sections in `asdd-template.md`, in order:

**a. Gather context**, in priority order:
1. **Repo scan** (if a repo is present): stack, config files, deployment manifests, schema, service boundaries — relevant to this specific section.
2. **User-supplied brief text**: extract anything from the user's original brief/description that answers this section.
3. **Direct question**: only for what remains unresolved after (1) and (2). One question at a time, multiple-choice where sensible.

**b. Draft the section** from whatever combination of evidence is available.

**c. Best-practice challenge** — applies to sections representing a consequential architecture/design decision: **#5 High-Level Architecture, #7 Technology Stack, #8 Deployment Topology, #9 Scalability and Multi-Tenancy, #10 Security Considerations, #11 Configuration Management, #12 Data Model Overview, #13 Inter-Service Communication, #14 Observability, #15 Error Handling and Retry Strategy, #16 Extensibility and Customization, #20 Compliance/Regulatory Notes**. Skip the challenge step for purely descriptive/administrative sections (`#1 Overview, #2 Goals and Non-Goals, #3 Stakeholders, #4 Glossary, #6 Modules and Responsibilities, #17 API Surface, #18 Dependency Map, #19 Risks and Technical Debt, #21 Change History, #22 Open Questions`).

Evaluate the drafted answer against the **Best-Practice Evaluation Checklist** in `STANDARDS.md`. If it conflicts or looks infeasible, state the specific concern (what's wrong, the risk) and ask the user to reconsider. If the user insists after being challenged, ask for their reason, then record the deviation inline directly under that section using the **Deviation Note Format** from `STANDARDS.md`:

```markdown
> ⚠️ Deviation from best practice: {practice}. Reason: {user's reason}.
```

**d. Diagram generation** — if this section is one of the 4 diagram sections and diagrams were opted in (Step 2), go to Step 5 for this section before moving to the next.

### Step 4 — Gap Check

After all 22 sections are drafted, re-scan the full document for any remaining `{...}` template placeholder or blank required field/table cell. Loop back with a targeted question for anything unresolved. Never leave a placeholder in the final output.

### Step 5 — Diagram Generation (per opted-in section)

1. Build the mxGraph XML using the **drawio XML Template** in `STANDARDS.md`, populated with the actual components/flows discussed for that section (e.g. §5 uses the real client/gateway/service/DB components identified during Step 3, not the template's placeholder boxes).
2. Write `docs/asdd/diagrams/{project_name}-{section-slug}.drawio`.
3. Build the HTML viewer using the **HTML Embed Template** in `STANDARDS.md`, embedding the same diagram content via the `data-mxgraph` attribute.
4. Write `docs/asdd/diagrams/{project_name}-{section-slug}.html`.
5. Run the **Diagram Validation Checklist** in `STANDARDS.md` against both files. If any check fails, regenerate both files from scratch — never patch individual lines.
6. Reference both files from the ASDD section body:
   ```markdown
   Diagram: [{project_name}-{section-slug}.drawio](diagrams/{project_name}-{section-slug}.drawio) · [view](diagrams/{project_name}-{section-slug}.html)
   ```

### Step 6 — Update Mode (existing doc)

1. Ask: *"Which section(s) do you want to update?"*
2. Apply Step 3's context-gathering priority and best-practice challenge loop, scoped to only the named section(s).
3. If diagrams already exist for this doc (files present under `docs/asdd/diagrams/{project_name}-*`), or the user newly opts in for an edited diagram section, regenerate only the diagram(s) for the touched section(s) (Step 5), leaving other diagrams untouched.
4. **Cross-section contradiction check**: re-read the rest of the document. If the change conflicts with another section's stated facts (e.g. §8 Deployment Topology changes to Kubernetes, but §11 Configuration Management still says "single VM `.env` file"), raise this explicitly to the user and ask how to reconcile before writing. Do not silently edit unrelated sections, and do not silently leave a contradiction in place.
5. Add a row to **§21 Change History**: bump `Version`, set `Date` to today, `Author` = "cognia-asdd interactive session", `Description` = a one-line summary of what changed.
6. Proceed to Step 4 (Gap Check), scoped to the edited sections, then Step 7.

### Step 7 — Write the File

Write `docs/asdd/{project_name}-asdd.md` in full (always overwrite entirely, never append — the file must always be internally complete, not just the edited sections).

---

## Output Format

Match the exact section order and headings of `asdd-template.md` (all 22 sections). Every section fully filled — no `{...}` tokens remaining except where the template itself defines a table with genuinely no rows yet (must not happen after the Gap Check in Step 4). Deviation notes (if any) appear as a blockquote directly beneath the heading of the section they apply to. Diagram references (if generated) appear as a one-line link pair directly beneath the section's prose.

---

## Definition of Done

- [ ] All 22 sections present, fully filled, no `{...}` placeholders remain
- [ ] Diagram opt-in question was asked exactly once per fresh-doc session
- [ ] If diagrams were opted in: all 4 required sections (§5, §8, §12, §13) have both a `.drawio` and `.html` file, and both pass the Diagram Validation Checklist in `STANDARDS.md`
- [ ] Every user override of a best-practice challenge has an inline deviation note with a stated reason
- [ ] Update Mode: only the requested section(s) changed in substance, a Change History row was added, and any cross-section contradiction introduced by the edit was raised to the user and resolved before writing
- [ ] File(s) written under `docs/asdd/` (and `docs/asdd/diagrams/` if applicable) — not returned only in chat
