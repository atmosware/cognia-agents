---
name: cognia-asdd
description: 'Use when you need to author a full Application System Design Document (ASDD) through an interactive interview across all 22 sections of docs/asdd-template.md. Act as a principal architect. Use for greenfield ideas, existing-system documentation, target-state design, migration planning, or updates to an existing ASDD. Distinguishes current, target, and migration views; gathers repo evidence and user-supplied context before asking gap-only questions; challenges consequential choices; logs accepted deviations; and optionally generates validated diagram sets (focused .drawio, sanitized static .svg, and detailed serverless HTML architecture companion) for sections 5, 8, 12, 13. Outputs: docs/asdd/{project_name}-asdd.md (+ docs/asdd/diagrams/*.drawio, *.svg, *.html if diagrams are opted in).'
argument-hint: 'Describe the product/system to document (name + optional brief), or say "update section 8 of the {project_name} ASDD" to revise an existing doc.'
version: 1.2.0
last_reviewed: 2026-07-31
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
| SVG sanitizer | `scripts/sanitize-svg.js` | Ships with Cognia. Required after CLI SVG export. |
| Diagram validator | `scripts/validate-diagram-set.js` | Ships with Cognia. Required for every generated artifact set. |

A source repository is optional. If present, it is used as one evidence source (Step 3a); if absent, the interview relies on the user's brief text and direct answers only.

---

## Output Location

Create folder `docs/asdd/` if it does not exist, and write:
- `docs/asdd/{project_name}-asdd.md` — the full ASDD

If diagrams are opted in (Step 2), also create `docs/asdd/diagrams/` and write, per opted-in section:
- `docs/asdd/diagrams/{project_name}-{section-slug}.drawio` — native mxGraph XML
- `docs/asdd/diagrams/{project_name}-{section-slug}.svg` — static, browser-renderable diagram asset
- `docs/asdd/diagrams/{project_name}-{section-slug}.html` — detailed, serverless architecture companion that references the sibling SVG asset

`{section-slug}` values: `high-level-architecture` (§5), `deployment-topology` (§8), `data-model-overview` (§12), `inter-service-communication` (§13).

> ⚠️ Always overwrite target files completely when writing — never append.

---

## Procedure

### Step 1 — Determine Mode

Ask the user for the product/project name if not already given, then check whether `docs/asdd/{project_name}-asdd.md` already exists.

- If it exists → **Update Mode**, go to Step 6.
- If it does not exist → **Create Mode**, go to Step 2.

Before either branch, classify the evidence context and architecture view:

- **Evidence context**: `Greenfield` (brief/interview, no implementation evidence), `Existing system` (repository/infrastructure evidence), or `Hybrid` (existing implementation plus planned changes).
- **Architecture view**: `Current` (as implemented), `Target` (intended future design), or `Migration` (current-to-target transition).

For a greenfield idea, default to `Target`. For an existing repository, infer the requested view only when the user clearly asks for current-state documentation; otherwise ask one clarifying question because mixing implemented and proposed architecture silently is prohibited. Keep these classifications in working notes and include them in every generated HTML companion.

### Step 2 — Diagram Opt-In (Create Mode only, asked once)

Ask: *"Do you want draw.io diagrams for the architecture sections — #5 High-Level Architecture, #8 Deployment Topology, #12 Data Model Overview, #13 Inter-Service Communication?"*

Store the answer for the rest of this session. If no, skip all diagram generation (Step 5) entirely for every section in this run.

### Step 3 — Fill Each Section (Create Mode)

For each of the 22 sections in `asdd-template.md`, in order:

**a. Gather context**, in priority order:
1. **Repo scan** (if a repo is present): stack, config files, deployment manifests, schema, service boundaries — relevant to this specific section.
2. **User-supplied brief text**: extract anything from the user's original brief/description that answers this section.
3. **Direct question**: only for what remains unresolved after (1) and (2). One question at a time, multiple-choice where sensible.

Tag each resolved item in working notes as `Confirmed` (implementation evidence), `From brief`, `User-provided`, or `Proposed`. In `Hybrid` or `Migration` work, record current and target facts separately; never merge them into one unlabeled statement or diagram element.

**b. Draft the section** from whatever combination of evidence is available.

**c. Best-practice challenge** — applies to sections representing a consequential architecture/design decision: **#5 High-Level Architecture, #7 Technology Stack, #8 Deployment Topology, #9 Scalability and Multi-Tenancy, #10 Security Considerations, #11 Configuration Management, #12 Data Model Overview, #13 Inter-Service Communication, #14 Observability, #15 Error Handling and Retry Strategy, #16 Extensibility and Customization, #20 Compliance/Regulatory Notes**. Skip the challenge step for purely descriptive/administrative sections (`#1 Overview, #2 Goals and Non-Goals, #3 Stakeholders, #4 Glossary, #6 Modules and Responsibilities, #17 API Surface, #18 Dependency Map, #19 Risks and Technical Debt, #21 Change History, #22 Open Questions`).

Evaluate the drafted answer against the **Best-Practice Evaluation Checklist** in `STANDARDS.md`. If it conflicts or looks infeasible, state the specific concern (what's wrong, the risk) and ask the user to reconsider. If the user insists after being challenged, ask for their reason, then record the deviation inline directly under that section using the **Deviation Note Format** from `STANDARDS.md`:

```markdown
> ⚠️ Deviation from best practice: {practice}. Reason: {user's reason}.
```

**d. Diagram input capture** — if this section is one of the 4 diagram sections and diagrams were opted in (Step 2), capture a normalized working model: view type; evidence basis; components and ownership; relationships/protocols; trust and consistency boundaries; critical operations; known gaps; and evidence tag for every material item. Defer file generation until after Step 4 so the HTML companion can incorporate relevant security, deployment, failure-handling, observability, and consistency decisions from the complete ASDD.

### Step 4 — Gap Check

After all 22 sections are drafted, re-scan the full document for any remaining `{...}` template placeholder or blank required field/table cell. Loop back with a targeted question for anything unresolved. Never leave a placeholder in the final output. When the document is complete, generate every opted-in diagram set in Create Mode—or only the queued touched set(s) in Update Mode—via Step 5, then continue to Step 7.

### Step 5 — Diagram Generation (per opted-in section, after Gap Check)

1. Finalize the **diagram companion content model** captured in Step 3d from the completed ASDD: architecture view and evidence basis; purpose and scope; the problem this view solves; every component and its responsibility, ownership, dependencies, and evidence tag; every communication path and relationship; critical operations with ordered steps, consistency boundary, failure handling, security controls, and observability; known gaps; and material constraints/trade-offs. Do not invent facts. If a material detail required by the **Architecture Companion HTML Template** remains unresolved, ask one targeted gap question before generating artifacts.
2. Build focused mxGraph XML using the **drawio XML Template** in `STANDARDS.md`, populated with the actual components and flows discussed for that section. Optimize the diagram for visual clarity; it may intentionally contain less explanatory detail than the HTML companion.
3. Write `docs/asdd/diagrams/{project_name}-{section-slug}.drawio`.
4. Probe for a diagrams.net CLI using the **SVG Export Strategy** in `STANDARDS.md`. If available, export the `.drawio` source to SVG. If unavailable, generate equivalent standards-compliant SVG directly from the same model. In both paths, run `scripts/sanitize-svg.js` with the real title and description. Do not add scripts, remote resources, or runtime viewer dependencies.
5. Build `docs/asdd/diagrams/{project_name}-{section-slug}.html` from the **Architecture Companion HTML Template** in `STANDARDS.md`, populated from the richer content model in Step 5.1. It must label the architecture view and evidence basis, reference the sibling SVG using a relative `<img src="./{project_name}-{section-slug}.svg">`, and distinguish confirmed/current facts from proposed/target facts. Do not embed mxGraph XML or load diagrams.net JavaScript.
6. Perform the **Rendered Visual Validation** in `STANDARDS.md`: render or open the SVG/PNG preview, inspect it, and simplify/regenerate the full artifact set if labels overlap, content is cropped, flow is ambiguous, or the diagram is too dense. If rendering is unavailable, record `Visual validation not performed: rendering capability unavailable` and do not claim full visual validation.
7. Run `scripts/validate-diagram-set.js` with the truthful visual status and complete the full **Diagram Validation Checklist** in `STANDARDS.md` against all three files.
8. If any automated, semantic, or visual check fails, regenerate the `.drawio`, `.svg`, and `.html` files from scratch — never patch individual generated lines.
9. Reference all three files from the ASDD section body:
   ```markdown
   Diagram: [draw.io source](diagrams/{project_name}-{section-slug}.drawio) · [SVG](diagrams/{project_name}-{section-slug}.svg) · [view](diagrams/{project_name}-{section-slug}.html)
   ```

### Step 6 — Update Mode (existing doc)

1. Ask: *"Which section(s) do you want to update?"*
2. Confirm whether the edit represents a `Current`, `Target`, or `Migration` view when the request does not make that explicit, then apply Step 3's context-gathering priority and best-practice challenge loop, scoped to only the named section(s).
3. If diagrams already exist for this doc (files present under `docs/asdd/diagrams/{project_name}-*`), or the user newly opts in for an edited diagram section, queue only the touched section's diagram set for regeneration after the contradiction and gap checks; leave other diagram sets untouched.
4. **Cross-section contradiction check**: re-read the rest of the document. If the change conflicts with another section's stated facts (e.g. §8 Deployment Topology changes to Kubernetes, but §11 Configuration Management still says "single VM `.env` file"), raise this explicitly to the user and ask how to reconcile before writing. Do not silently edit unrelated sections, and do not silently leave a contradiction in place.
5. Add a row to **§21 Change History**: bump `Version`, set `Date` to today, `Author` = "cognia-asdd interactive session", `Description` = a one-line summary of what changed.
6. Proceed to Step 4 (Gap Check), scoped to the edited sections, regenerate any queued diagram set via Step 5, then continue to Step 7.

### Step 7 — Write the File

Write `docs/asdd/{project_name}-asdd.md` in full (always overwrite entirely, never append — the file must always be internally complete, not just the edited sections).

---

## Output Format

Match the exact section order and headings of `asdd-template.md` (all 22 sections). Every section fully filled — no `{...}` tokens remaining except where the template itself defines a table with genuinely no rows yet (must not happen after the Gap Check in Step 4). Deviation notes (if any) appear as a blockquote directly beneath the heading of the section they apply to. Diagram references (if generated) appear as a one-line `.drawio`/`.svg`/`.html` link trio directly beneath the section's prose.

---

## Definition of Done

- [ ] All 22 sections present, fully filled, no `{...}` placeholders remain
- [ ] Diagram opt-in question was asked exactly once per fresh-doc session
- [ ] If diagrams were opted in: all 4 required sections (§5, §8, §12, §13) have a `.drawio`, `.svg`, and `.html` file, and all three pass the Diagram Validation Checklist in `STANDARDS.md`
- [ ] Every diagram companion declares `Greenfield` / `Existing system` / `Hybrid` evidence context and `Current` / `Target` / `Migration` architecture view without silently mixing implemented and proposed facts
- [ ] Every CLI-exported SVG was normalized by `scripts/sanitize-svg.js`; every artifact set passed `scripts/validate-diagram-set.js`
- [ ] Rendered visual validation passed for every diagram, or the final response explicitly says it was unavailable and does not claim full visual validation
- [ ] Every generated HTML companion explains the view's purpose, all depicted components and relationships, and all identified critical operations with their consistency, failure, security, and observability considerations
- [ ] Every user override of a best-practice challenge has an inline deviation note with a stated reason
- [ ] Update Mode: only the requested section(s) changed in substance, a Change History row was added, and any cross-section contradiction introduced by the edit was raised to the user and resolved before writing
- [ ] File(s) written under `docs/asdd/` (and `docs/asdd/diagrams/` if applicable) — not returned only in chat
