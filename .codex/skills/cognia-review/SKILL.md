---
name: cognia-review
description: "Use when you need a deep code review of a pull request, branch, or changeset — auto-detects project type, performs structural, semantic, architectural, regression-risk, performance, security, test-alignment and communication-quality analysis of the diff (not the whole repo), and delivers prioritised file:line findings with suggested patches and a Change Risk Score."
argument-hint: "PR number, branch comparison, or change description (e.g. \"review PR #842\", \"review feature/payments-v2 vs main\", \"review my staged changes\", \"review the last 3 commits — focus on auth\")."
---

# cognia-review skill

This skill is a runtime registration wrapper. The canonical procedure, dimensions, severity calibration, Change Risk Score formula, and output format are defined in:

- `.github/agents/cognia-review.agent.md`

Read that file and follow every instruction defined there exactly.
