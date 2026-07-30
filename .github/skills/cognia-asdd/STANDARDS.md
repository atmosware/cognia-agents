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

## HTML Embed Template (diagrams.net viewer)

Use this as the base structure for every `docs/asdd/diagrams/{project_name}-{section-slug}.html` file. The `xml` value inside `data-mxgraph` must be the **exact same** `<mxGraphModel>…</mxGraphModel>` content written to the corresponding `.drawio` file for this section (HTML-entity-escape double quotes as `&quot;`), so the two files never drift out of sync.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Diagram Title} — {project_name}</title>
  <script type="text/javascript" src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
  <style>
    body { font-family: system-ui, 'Segoe UI', sans-serif; background: #fdfaf5; margin: 0; padding: 32px; color: #2c1a0e; }
    h1 { color: #7c4a1e; font-size: 1.4rem; margin-bottom: 16px; }
    .mxgraph { border: 1px solid #e8d9c4; border-radius: 10px; background: #ffffff; }
  </style>
</head>
<body>
  <h1>{Diagram Title}</h1>
  <div class="mxgraph" style="max-width:100%;width:1100px;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;toolbar&quot;:&quot;zoom layers lightbox&quot;,&quot;edit&quot;:&quot;_blank&quot;,&quot;xml&quot;:&quot;&lt;mxGraphModel dx=\&quot;800\&quot; dy=\&quot;600\&quot; grid=\&quot;1\&quot; gridSize=\&quot;10\&quot; guides=\&quot;1\&quot; tooltips=\&quot;1\&quot; connect=\&quot;1\&quot; arrows=\&quot;1\&quot; fold=\&quot;1\&quot; page=\&quot;1\&quot; pageScale=\&quot;1\&quot; pageWidth=\&quot;1100\&quot; pageHeight=\&quot;850\&quot; math=\&quot;0\&quot; shadow=\&quot;0\&quot;&gt;&lt;root&gt;&lt;mxCell id=\&quot;0\&quot;/&gt;&lt;mxCell id=\&quot;1\&quot; parent=\&quot;0\&quot;/&gt;&lt;mxCell id=\&quot;client\&quot; value=\&quot;Client\&quot; style=\&quot;rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;\&quot; vertex=\&quot;1\&quot; parent=\&quot;1\&quot;&gt;&lt;mxGeometry x=\&quot;40\&quot; y=\&quot;40\&quot; width=\&quot;160\&quot; height=\&quot;60\&quot; as=\&quot;geometry\&quot;/&gt;&lt;/mxCell&gt;&lt;/root&gt;&lt;/mxGraphModel&gt;&quot;}">
  </div>
</body>
</html>
```

**Rules:**
- `viewer-static.min.js` script tag present exactly once, in `<head>`.
- `data-mxgraph` value must be valid JSON once its `&quot;` entities are decoded — verify by mentally (or actually) decoding before writing.
- The `xml` key's value is the `<mxGraphModel>` element only (not the outer `<mxfile>`/`<diagram>` wrapper), matching the `.drawio` file's inner content exactly, with all double quotes inside it escaped first to `\&quot;` and the whole value's outer quotes to `&quot;`.
- Populate the example above with the real diagram for the section being generated — the abbreviated single-node example shown is illustrative of the escaping pattern only, not a diagram to ship as-is.

---

## Diagram Validation Checklist

Run against both the `.drawio` and `.html` file for a section before considering Step 5 (SKILL.md) complete:

1. **`.drawio` well-formed** — starts with `<mxfile`, contains exactly one `<diagram>` element, and every opened tag is closed.
2. **Unique vertex ids** — no two `<mxCell>` vertices share an `id`.
3. **Valid edges** — every edge cell's `source`/`target` references an `id` that exists among the vertices.
4. **No placeholder labels** — no `{...}` token remains in any `value="..."` attribute; every label is a real, discussed component name.
5. **`.html` script present once** — `<script ... src="https://viewer.diagrams.net/js/viewer-static.min.js">` appears exactly once.
6. **`data-mxgraph` is valid JSON** — decoding the `&quot;`-escaped attribute yields parseable JSON with a non-empty `xml` key.
7. **`.drawio`/`.html` diagrams match** — the `<mxGraphModel>` content embedded in the `.html` file's `xml` key is the same diagram as the `.drawio` file (same vertices/edges), not a stale or divergent copy.

If any check fails, regenerate **both** files from scratch — never patch individual lines in either.

---

## Definition of Done (Standards Addendum)

In addition to the Definition of Done in `SKILL.md`, verify:

- [ ] Every Best-Practice Evaluation Checklist item above was explicitly considered for its applicable section(s), not silently skipped
- [ ] Every generated `.drawio`/`.html` pair passes all 7 items in the Diagram Validation Checklist
- [ ] No diagram file exists for a section that was not opted into (Step 2 of `SKILL.md`)
