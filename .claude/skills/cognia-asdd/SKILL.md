---
name: cognia-asdd
description: "Use when you need to author a full Application System Design Document (ASDD) through an interactive interview across all 22 sections of docs/asdd-template.md. Act as a principal architect. Use when: documenting a new or existing system's architecture end-to-end, producing an onboarding-grade design doc, recording high-level architecture/deployment/data-model/inter-service-communication diagrams. Gathers context from the repo and any user-supplied brief first, asks only for remaining gaps one question at a time, challenges answers against industrial best practice, logs any accepted deviation with its reason, and optionally generates draw.io diagrams (native .drawio + embedded HTML viewer) for sections 5, 8, 12, 13. Outputs: docs/asdd/{project_name}-asdd.md (+ docs/asdd/diagrams/*.drawio, *.html if diagrams are opted in). Supports updating a single section of an existing ASDD with a cross-section contradiction check."
argument-hint: "Describe the product/system to document (name + optional brief), or say \"update section 8 of the {project_name} ASDD\" to revise an existing doc."
---

# cognia-asdd

Read `.github/skills/cognia-asdd/SKILL.md` and follow every instruction defined there exactly.
