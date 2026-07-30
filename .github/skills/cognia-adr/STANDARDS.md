# ADR Authoring Standards

> **Tier 2 — Skill-local standards.** Extends [Core Standards (Tier 1)](../../standards/core.md). Core standards always take precedence; this file adds ADR-authoring–specific rules only.

---

## Numbering Convention

- 3-digit, zero-padded, strictly incrementing: `001`, `002`, `003`, …
- Never reuse a number, even if the corresponding ADR is later Rejected or Superseded.
- Slug: kebab-case, derived from the `Decision` section's title, capped at roughly 6 words (e.g. `adr-004-kafka-for-event-bus.md`).

---

## Deviation Note Format

Use exactly this blockquote, placed directly beneath the heading of the section the deviation applies to (`Decision`, `Considered Options`, or `Consequences` — wherever the conflicting choice lives):

```markdown
> ⚠️ Deviation from best practice: {practice}. Reason: {user's reason}.
```

- `{practice}` — name the specific industrial best practice being deviated from, in one clause.
- `{user's reason}` — record the user's own words or a faithful paraphrase; never invent or soften the reason.
- Multiple deviations in the same ADR get multiple separate blockquotes, one per issue.

---

## Immutability Rule

| Status | Editing policy |
|---|---|
| `Proposed` | May be freely edited in place, section by section. |
| `Accepted` | Treated as frozen. An update request becomes a **new** ADR with `Related Decisions: Supersedes ADR-{NNN}`. The OLD ADR gets exactly one line changed: `Status` → `Superseded by ADR-{new NNN}`. |
| `Rejected` | Same immutability treatment as Accepted — propose a new ADR referencing it rather than editing. |
| `Deprecated` | Same immutability treatment as Accepted — propose a new ADR referencing it rather than editing. |

If the user insists on editing an Accepted/Rejected/Deprecated ADR in place despite this guidance, that is itself a best-practice deviation and must be logged with the Deviation Note Format above, using `{practice}` = "ADR immutability after Accepted/Rejected/Deprecated status".

---

## Best-Practice Evaluation Checklist (used in SKILL.md Step 4)

Evaluate the proposed `Decision`/`Considered Options` against each of these. If any triggers, raise the specific concern to the user before accepting the Decision as final:

- Does the decision introduce a single point of failure with no stated mitigation?
- Does it contradict a previously Accepted ADR in `docs/adr/` without acknowledging or superseding it?
- Does it accept vendor lock-in with no documented exit path?
- Does it gloss over a security or compliance concern (authN/authZ, data residency, secret handling)?
- Does it skip weighing operational cost/burden against the alternatives actually listed in `Considered Options`?
- Does `Consequences` list only positives, with no `Negative` or `Risks` entries at all? (A decision with zero acknowledged tradeoffs is itself a red flag — ask what's being glossed over.)

---

## Definition of Done (Standards Addendum)

In addition to the Definition of Done in `SKILL.md`, verify:

- [ ] Every checklist item above was explicitly considered, not silently skipped
- [ ] `Status` field default was `Proposed` unless the user explicitly confirmed `Accepted`
- [ ] Numbering does not collide with any file already present in `docs/adr/`
