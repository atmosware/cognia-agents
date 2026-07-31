# ASDD Authoring Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards always take precedence; this file adds ASDD-authoring–specific rules, including the draw.io diagram templates.

---

## Deviation Note Format

Identical convention to `cognia-adr`'s standards — use exactly this blockquote, placed directly beneath the heading of the affected section:

```markdown
> ⚠️ Deviation from best practice: {practice}. Reason: {user's reason}.
```

---

## Best-Practice Evaluation Checklist (used in SKILL.md Step 3c)

For each consequential section listed in `SKILL.md` Step 3c, check:

- **§5/§13 (Architecture/Communication)**: any synchronous call chain with no timeout/circuit-breaker mentioned? Any direct service-to-service DB access bypassing an owning service?
- **§7 (Tech Stack)**: an unsupported/EOL technology chosen with no migration plan stated?
- **§8 (Deployment)**: single-instance/no-redundancy deployment for a system stated to be business-critical?
- **§9 (Scalability)**: shared mutable state with no stated tenant-isolation or scaling mechanism?
- **§10 (Security)**: missing authN/authZ mechanism, secrets committed to config rather than a secrets manager, or no mention of transport security?
- **§11 (Configuration)**: environment-specific secrets hardcoded rather than externalized?
- **§12 (Data Model)**: no ownership stated for a table/entity touched by more than one module (a "God table" with no acknowledgement)?
- **§14 (Observability)**: no correlation ID / trace propagation mechanism for a system described as multi-service?
- **§15 (Error Handling)**: no retry/backoff or dead-letter strategy for an async integration?
- **§16 (Extensibility)**: a hardcoded switch/if-chain description in place of any stated extension point, for a system explicitly requiring plugin/customization support?
- **§20 (Compliance)**: a stated regulatory requirement (e.g. GDPR, HIPAA) with no corresponding data-retention or residency answer?

If any triggers: raise the specific concern before accepting the section's content as final.

---

## drawio XML Template (native `.drawio` file)

Use this as the base structure for every `docs/asdd/diagrams/{project_name}-{section-slug}.drawio` file. Replace the example vertices/edges with the actual components/flows identified for that section — never ship the example boxes verbatim.

```xml
<mxfile host="app.diagrams.net" agent="cognia-asdd" version="24.0.0" type="device">
  <diagram name="{Diagram Title}" id="{section-slug}">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="client" value="Client" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="gateway" value="API Gateway" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="280" y="40" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="service" value="Core Service" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="520" y="40" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="db" value="Database" style="shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="520" y="160" width="120" height="80" as="geometry" />
        </mxCell>
        <mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;" edge="1" parent="1" source="client" target="gateway">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;" edge="1" parent="1" source="gateway" target="service">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;" edge="1" parent="1" source="service" target="db">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

**Rules:**
- Every vertex `<mxCell>` must have a unique `id` and a `<mxGeometry>` child with `x`, `y`, `width`, `height`.
- Every edge `<mxCell>` must set `edge="1"` and reference existing vertex `id`s via `source`/`target`.
- Exactly one `<diagram>` element per file.
- `id="{section-slug}"` on the `<diagram>` element must match the file's own slug (`high-level-architecture`, `deployment-topology`, `data-model-overview`, or `inter-service-communication`).

---

## Static SVG Asset Template

Every diagram set includes a standalone SVG asset at `docs/asdd/diagrams/{project_name}-{section-slug}.svg`. Prefer exporting the completed `.drawio` file with a locally available diagrams.net CLI. If no exporter is available, generate SVG directly from the same resolved vertices, edges, labels, colors, and geometry. Either path must produce a static, dependency-free SVG that follows this structure:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 300" role="img" aria-labelledby="diagram-title diagram-description">
  <title id="diagram-title">{Diagram Title} — {project_name}</title>
  <desc id="diagram-description">{Concise description of the components and flows}</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
    </marker>
  </defs>
  <g id="edges" fill="none" stroke="#6b7280" stroke-width="2" marker-end="url(#arrow)">
    <path id="edge-e1" d="M 200 70 L 280 70" />
  </g>
  <g id="nodes" font-family="system-ui, Segoe UI, sans-serif" font-size="14" text-anchor="middle">
    <g id="node-client">
      <rect x="40" y="40" width="160" height="60" rx="8" fill="#dae8fc" stroke="#6c8ebf" />
      <text x="120" y="75">Client</text>
    </g>
    <g id="node-gateway">
      <rect x="280" y="40" width="160" height="60" rx="8" fill="#d5e8d4" stroke="#82b366" />
      <text x="360" y="75">API Gateway</text>
    </g>
  </g>
</svg>
```

The sample is structural only. Replace every sample node and edge with the real section content.

**Rules:**
- The root `<svg>` must declare the SVG namespace, a `viewBox`, `role="img"`, and `aria-labelledby` values that resolve to one non-empty `<title>` and `<desc>`.
- Map every `.drawio` vertex to a visible SVG shape and `<text>` label. Use stable `id="node-{drawio-id}"` identifiers after replacing characters invalid in XML ids.
- Map every `.drawio` edge to a visible `<path>` or `<polyline>`, preserving direction with a local marker when the source edge is directed. Use stable `id="edge-{drawio-id}"` identifiers.
- Preserve the `.drawio` diagram's labels, colors, relative placement, and flow direction. Exact pixel equality is not required; semantic and visual equivalence is.
- XML-escape all user-provided labels and descriptions.
- Keep the SVG self-contained: no `<script>`, event-handler attributes, remote URLs, external stylesheets/fonts/images, `data:` URLs, `<iframe>`, `<object>`, or `<embed>`.

---

## SVG Export Strategy and Normalization

Probe for a local diagrams.net CLI without installing anything. Common executable names/locations are `drawio`, `draw.io`, `draw.io.exe`, and `/Applications/draw.io.app/Contents/MacOS/draw.io`.

When available, export the completed source without embedding the diagram or fonts:

```bash
drawio --export --format svg --theme light --embed-svg-fonts false --border 16 \
  --output docs/asdd/diagrams/{project_name}-{section-slug}.svg \
  docs/asdd/diagrams/{project_name}-{section-slug}.drawio
```

When no CLI is available, generate SVG directly from the normalized diagram content model and the Static SVG Asset Template. In both cases, run the shipped sanitizer afterward:

```bash
node {cognia-asdd-skill-dir}/scripts/sanitize-svg.js \
  docs/asdd/diagrams/{project_name}-{section-slug}.svg \
  --title "{Diagram Title} — {project_name}" \
  --description "{Concise diagram-specific description}"
```

The sanitizer operates atomically and fails closed. It removes exported DOCTYPE and the known diagrams.net external fallback link, normalizes accessible title/description metadata, and rejects scripts, event handlers, active embedded elements, remote resource references, data URLs, and external CSS. XML namespace and SVG feature identifiers are not remote resource references and are permitted.

Do not hand-edit a sanitizer failure away. Correct the `.drawio`/SVG generation input, regenerate, and rerun the sanitizer.

---

## Architecture Companion HTML Template

Use this as the base structure for every `docs/asdd/diagrams/{project_name}-{section-slug}.html` file. The diagram stays visually focused; this HTML companion uses the available page space for the deeper architectural explanation. It imports the sibling SVG as a normal static image, works when opened directly from disk with a `file://` URL, and must not embed mxGraph XML or depend on diagrams.net JavaScript.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Diagram Title} — {project_name}</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, 'Segoe UI', sans-serif; }
    body { margin: 0; padding: 32px; background: #fdfaf5; color: #2c1a0e; line-height: 1.55; }
    main { max-width: 1180px; margin: 0 auto; }
    h1, h2, h3 { color: #7c4a1e; }
    h1 { font-size: 1.7rem; margin: 0 0 8px; }
    h2 { margin-top: 36px; border-bottom: 1px solid #e8d9c4; padding-bottom: 8px; }
    .summary { max-width: 80ch; font-size: 1.05rem; }
    .diagram { display: block; width: 100%; height: auto; border: 1px solid #e8d9c4; border-radius: 10px; background: #fff; }
    .assets { margin-top: 12px; font-size: 0.9rem; }
    .facts { display: grid; grid-template-columns: minmax(160px, 240px) 1fr; gap: 8px 20px; }
    .facts dt { font-weight: 700; }
    .facts dd { margin: 0; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    caption { text-align: left; font-weight: 700; margin-bottom: 8px; }
    th, td { border: 1px solid #d8c6af; padding: 10px; text-align: left; vertical-align: top; }
    th { background: #f2e8dc; }
    .operation { border-left: 4px solid #b7793e; padding: 4px 0 4px 18px; margin: 24px 0; }
    @media (prefers-color-scheme: dark) {
      body { background: #17120f; color: #f5e9dc; }
      h1, h2, h3 { color: #e7b77f; }
      th { background: #35271e; }
      th, td { border-color: #66503f; }
    }
  </style>
</head>
<body>
  <main>
    <h1>{Diagram Title}</h1>
    <p class="summary">{What this architecture view covers and why it matters}</p>

    <section aria-labelledby="diagram-heading">
      <h2 id="diagram-heading">Diagram</h2>
      <figure>
        <img class="diagram" src="./{project_name}-{section-slug}.svg" alt="{Diagram Title}">
        <figcaption>{How to read the diagram, including its boundary and flow direction}</figcaption>
      </figure>
      <p class="assets">
        <a href="./{project_name}-{section-slug}.svg">Open SVG</a> ·
        <a href="./{project_name}-{section-slug}.drawio">Edit draw.io source</a>
      </p>
    </section>

    <section aria-labelledby="purpose-heading">
      <h2 id="purpose-heading">Purpose and scope</h2>
      <dl class="facts">
        <dt>Architecture view</dt><dd>{Current, Target, or Migration}</dd>
        <dt>Evidence basis</dt><dd>{Greenfield brief/interview, Existing-system repository evidence, or Hybrid evidence with current/proposed facts distinguished}</dd>
        <dt>Problem addressed</dt><dd>{Architectural problem or capability this view explains}</dd>
        <dt>In scope</dt><dd>{Included responsibilities, flows, data, or runtime boundary}</dd>
        <dt>Out of scope</dt><dd>{Relevant boundary exclusions and where they are documented}</dd>
      </dl>
    </section>

    <section aria-labelledby="components-heading">
      <h2 id="components-heading">Components</h2>
      <div class="table-wrap">
        <table>
          <caption>Component responsibilities and relationships</caption>
          <thead><tr><th scope="col">Component</th><th scope="col">Type / boundary</th><th scope="col">Responsibility and problem solved</th><th scope="col">Owns</th><th scope="col">Depends on</th></tr></thead>
          <tbody>
            <tr><th scope="row">{Component}</th><td>{Service, datastore, client, platform, or external system}</td><td>{Why it exists and what it does}</td><td>{Data, state, policy, or capability}</td><td>{Direct dependencies}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="communications-heading">
      <h2 id="communications-heading">Communication and relationships</h2>
      <div class="table-wrap">
        <table>
          <caption>Interfaces and interaction semantics</caption>
          <thead><tr><th scope="col">Source → target</th><th scope="col">Mechanism</th><th scope="col">Purpose / contract</th><th scope="col">Interaction</th><th scope="col">Reliability, security, and trust boundary</th></tr></thead>
          <tbody>
            <tr><th scope="row">{Source} → {Target}</th><td>{Protocol, API, event, query, or storage relation}</td><td>{Data or command exchanged and why}</td><td>{Sync/async, direction, cardinality, or ownership}</td><td>{Timeout/retry/idempotency/authN/authZ/encryption as applicable}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="operations-heading">
      <h2 id="operations-heading">Critical operations</h2>
      <article class="operation">
        <h3>{Critical operation name}</h3>
        <p><strong>Why critical:</strong> {Business or technical impact and required outcome}</p>
        <ol>
          <li>{Ordered interaction step with named component}</li>
          <li>{Ordered interaction step with named component}</li>
        </ol>
        <dl class="facts">
          <dt>Consistency boundary</dt><dd>{Transaction, eventual-consistency, ordering, or idempotency boundary}</dd>
          <dt>Failure handling</dt><dd>{Timeout, retry/backoff, compensation, circuit breaker, or recovery path}</dd>
          <dt>Security</dt><dd>{Identity, authorization, data protection, and trust-boundary controls}</dd>
          <dt>Observability</dt><dd>{Trace/correlation context, metrics, logs, alerts, and success/failure signal}</dd>
        </dl>
      </article>
    </section>

    <section aria-labelledby="notes-heading">
      <h2 id="notes-heading">Constraints, decisions, and trade-offs</h2>
      <ul>
        <li>{Material design constraint, decision, assumption, or accepted trade-off}</li>
      </ul>
    </section>
  </main>
</body>
</html>
```

**Rules:**
- Keep the `.drawio`/SVG focused and readable. Rich explanations belong in the HTML and need not appear as diagram labels or callouts.
- The diagram `<img>` must use only the sibling SVG basename via a relative `./...svg` path.
- Use the same `{project_name}-{section-slug}` basename for `.drawio`, `.svg`, and `.html`.
- Keep the page serverless and dependency-free: no `<script>`, `data-mxgraph`, inline SVG copy, remote URL, `<iframe>`, `<object>`, or `<embed>`.
- The `<img alt>` text and page title must identify the actual section diagram.
- `Architecture view` must be exactly `Current`, `Target`, or `Migration`. `Evidence basis` must identify Greenfield, Existing system, or Hybrid and summarize the evidence source.
- In `Current` views, do not present proposed elements as implemented. In `Target` views, label repository-derived constraints separately from proposed choices. In `Migration` views, explicitly distinguish current components/flows, target components/flows, and transition-only elements.
- Populate every template section with diagram-specific prose; do not merely copy the ASDD section or expand node labels into sentences.
- The component table must cover every component depicted in the diagram and may add non-visual supporting components when needed for explanation; identify details intentionally omitted from the visual to preserve readability.
- The communication table must cover every depicted edge/relationship and state protocol or relation type, purpose, direction/interaction style, and applicable reliability/security behavior.
- Document all identified section-relevant critical operations. Each operation must name participating components, give ordered steps, explain why it is critical, and cover consistency, failure handling, security, and observability. If evidence establishes that no critical operation exists for the view, state that explicitly with the reason instead of inventing one.
- Tailor critical-operation analysis to the section: §5 emphasizes end-to-end system paths; §8 deployment, failover, scaling, release, and recovery; §12 reads/writes, ownership, transactions, and consistency; §13 request/event delivery, timeouts, retries, ordering, idempotency, and dead-letter handling.
- HTML-escape all user- or repository-derived content.

---

## Rendered Visual Validation

Structural checks cannot detect an unreadable diagram. After generating and sanitizing the SVG, render or open it and inspect the actual pixels. Prefer a temporary PNG exported from the `.drawio` source when a diagrams.net CLI is available; otherwise inspect the SVG directly with an available image/browser tool. Do not add preview PNGs to the ASDD output directory.

Confirm all of the following:

1. No node or edge label overlaps another label, node, or arrowhead.
2. No node, label, edge, or title is cropped by the canvas/viewBox.
3. Text remains legible at a normal document width without zooming.
4. Flow direction is unambiguous and arrowheads are visible.
5. Edge crossings and line routing do not obscure relationships.
6. Colors have sufficient contrast and do not carry meaning without labels or grouping.
7. The diagram shows only the visual structure needed for orientation; explanatory detail stays in HTML.
8. The SVG and `.drawio` render the same nodes, edges, grouping, and direction.

If any item fails, simplify labels, move detail into HTML, adjust geometry/routing, and regenerate the complete `.drawio`/`.svg`/`.html` set. Do not solve visual defects by shrinking text below a readable size.

If no rendering or image-inspection capability exists, record exactly: `Visual validation not performed: rendering capability unavailable`. The artifacts may still be delivered after automated validation, but the final response and validation status must not claim that visual validation passed.

---

## Automated Artifact Validation

Run the shipped validator after structural/semantic review and rendered inspection:

```bash
node {cognia-asdd-skill-dir}/scripts/validate-diagram-set.js \
  --asdd docs/asdd/{project_name}-asdd.md \
  --visual-status passed \
  docs/asdd/diagrams/{project_name}-high-level-architecture \
  docs/asdd/diagrams/{project_name}-deployment-topology \
  docs/asdd/diagrams/{project_name}-data-model-overview \
  docs/asdd/diagrams/{project_name}-inter-service-communication
```

Use `--visual-status unavailable` only when the exact limitation from Rendered Visual Validation is reported. The validator checks deterministic structure, safety, accessibility, sibling links, required HTML sections, view/evidence labels, and ASDD references. It does not replace the semantic coverage checks or human/agent pixel inspection below.

---

## Diagram Validation Checklist

Run against the `.drawio`, `.svg`, and `.html` files for a section before considering Step 5 (SKILL.md) complete:

1. **`.drawio` well-formed** — starts with `<mxfile`, contains exactly one `<diagram>` element, and every opened tag is closed.
2. **Unique vertex ids** — no two `<mxCell>` vertices share an `id`.
3. **Valid edges** — every edge cell's `source`/`target` references an `id` that exists among the vertices.
4. **No placeholder labels** — no `{...}` token remains in any generated file; every label is a real, discussed component name.
5. **`.svg` is well-formed and accessible** — it parses as XML, has one root `<svg>` with a non-empty `viewBox`, and its `aria-labelledby` resolves to non-empty `<title>` and `<desc>` elements.
6. **`.drawio`/`.svg` diagrams match** — every `.drawio` vertex label and edge is represented in the SVG, with the same flow direction and materially equivalent placement and styling.
7. **`.svg` is static and self-contained** — it contains none of the active or external content forbidden by the Static SVG Asset Template rules.
8. **`.html` references the SVG once** — exactly one diagram `<img>` points to `./{project_name}-{section-slug}.svg`, and that sibling file exists.
9. **`.html` is serverless and static** — it contains no `<script>`, `data-mxgraph`, inline SVG, remote URL, `<iframe>`, `<object>`, or `<embed>`.
10. **Artifact basenames match** — the `.drawio`, `.svg`, and `.html` files use the same `{project_name}-{section-slug}` basename, and the HTML's source/edit links resolve to those sibling assets.
11. **HTML explanation is complete** — Purpose and scope, Components, Communication and relationships, Critical operations, and Constraints/decisions/trade-offs are present and contain no empty sections or generic filler.
12. **HTML covers the diagram** — every displayed component appears in the component table and every displayed relationship appears in the communication table; extra narrative detail is allowed and expected.
13. **Critical operations are actionable** — each identified operation names its participants and ordered steps and addresses consistency, failure handling, security, and observability, or explicitly documents why a concern is not applicable.
14. **View and evidence are explicit** — HTML declares Current/Target/Migration and Greenfield/Existing system/Hybrid evidence; current and proposed facts are not silently mixed.
15. **SVG normalization passed** — `scripts/sanitize-svg.js` completed without unsafe-content errors after the final SVG generation.
16. **Rendered visual inspection passed or is disclosed** — all 8 Rendered Visual Validation items passed, or the exact unavailable status is recorded without claiming success.
17. **Automated validation passed** — `scripts/validate-diagram-set.js` reports `PASS` for the final artifact set with the truthful visual status.

If any check fails, regenerate **all three** files from scratch — never patch individual lines in any artifact.

---

## Definition of Done (Standards Addendum)

In addition to the Definition of Done in `SKILL.md`, verify:

- [ ] Every Best-Practice Evaluation Checklist item above was explicitly considered for its applicable section(s), not silently skipped
- [ ] Every generated `.drawio`/`.svg`/`.html` set passes all 17 items in the Diagram Validation Checklist, subject only to an explicitly disclosed unavailable visual check
- [ ] No diagram file exists for a section that was not opted into (Step 2 of `SKILL.md`)
