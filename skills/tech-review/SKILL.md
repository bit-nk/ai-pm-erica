---
name: technical-feasibility-review
description: Helps a PM interpret a technical brief, architecture document, or solution architect output. Translates technical complexity into delivery-relevant language, surfaces risks hidden in technical decisions, identifies the right questions to raise with the SA or tech lead, and produces a PM-ready feasibility summary. Use when you receive an SA proposal, system design doc, integration spec, or tech stack decision and need to understand what it means for scope, timeline, and risk before committing to a plan.
version: 1.0.0
argument-hint: <SA proposal, architecture doc, or integration spec>
allowed-tools: Read
---

## Input

$ARGUMENTS

*If no input is provided above, ask: "Please paste the technical document, SA proposal, architecture brief, or integration spec you'd like reviewed. Include the project name and any known constraints (timeline, team size, budget)."*

---

# Output Format

## Technical Feasibility Review

**Project:** [Name]
**Document reviewed:** [Type and title if known]
**Date:** [Today]

---

### Document Type
[Architecture proposal / Integration spec / Data model / Tech stack decision / Spike output / Mixed]

---

### Plain-English Summary
[3-5 sentences. No jargon. What is being built, how the parts connect, what it replaces or depends on.]

---

### Delivery Implications
- **Timeline:** ...
- **Team / skills:** ...
- **Scope:** ...
- **Third-party dependencies:** ...
- **Operational / maintenance:** ...

---

### Risks Surfaced

| # | Risk | Likelihood | Impact | Note |
|---|---|---|---|---|
| R1 | ... | H/M/L | H/M/L | [Why this matters for delivery] |

**Top risk to act on now:** [R1 name - one sentence on why it's the priority]

---

### Dependencies

- [Specific dependency - what must be true or done before this can proceed]

---

### Questions for the SA / Tech Lead

1. [Specific, answerable question - delivery-focused]
2. ...

---

### Scope Implications
[What the technical approach means for the roadmap, sprint plan, or stakeholder expectations. Flag anything that implies more work than currently visible.]

---

### Feasibility Verdict

**[Verdict]**

[One sentence: the single most important next action for the PM.]

