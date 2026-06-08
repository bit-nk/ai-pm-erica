---
name: risk-scan
description: Identifies, evaluates, and recommends mitigation strategies for project risks across any phase of delivery. Use whenever a PM needs continuous risk discovery or decision support - including when someone says "analyse the risks on this project", "do a full risk analysis", "we need a risk review", "what risks should I be tracking right now", "update the risk picture", or shares project context and wants a structured risk assessment. It runs at any depth, from a fast initial pre-screen right after triage (Low depth) through to ongoing risk discovery across all project phases (Discovery through Deployment), adjusting depth to how much time the PM has. Use it at any phase gate, after significant scope changes, or when the risk landscape feels unclear.

version: 3.1.0
argument-hint: <project context, phase, and known risks>
allowed-tools: Read
---

## Input

$ARGUMENTS

*If no input is provided above, ask: "Please share the project context - name, phase, timeline, known risks, and any recent changes."*

---

# Before Starting - What to Gather

Extract or ask for these before writing anything:

| Input | Required? | Why |
|---|---|---|
| Project context | Yes | Scope, timeline, stakeholders, goals - without this, risks are generic |
| Current phase | Yes | Risk profile changes by phase - read `phase-guide.md` for phase-specific profiles |
| Known constraints | No | Fixed deadlines, budget caps - these turn risks into near-certainties |
| Recent changes | No | Scope, team, or requirement changes are a primary risk source |
| Depth needed | No | Default Medium - see depth table below |

If project context or current phase is missing, ask before proceeding.

---

# Risk Discovery Guidance

Identify risks across multiple dimensions.

Consider:

- Product value
- Customer adoption
- Delivery execution
- Technical architecture
- Security & privacy
- Compliance & legal
- Operational readiness
- Stakeholder alignment
- External dependencies
- Budget and commercial viability

Avoid concentrating all risks in one category unless evidence strongly supports it.

For early-stage initiatives, ensure at least one risk is considered from:

- Product/Customer
- Delivery/Technical
- Business/Compliance

If insufficient information exists to assess an area, record it in Not Assessed rather than assuming.

---

# Depth

| Depth | When | Risks | Sections to include |
|---|---|---|---|
| Low | "quick", "brief", initial pre-screen after triage | 3-5 | Overall Verdict, Top Risk Snapshot, Risk Register, Not Assessed |
| Medium | default | 5-8 | Full output including Key Assumptions |
| High | "thorough", "board report" | 8-12 | Full output including Key Assumptions and Prioritisation Reasoning |

Use Low depth as a fast pre-screen. Prefer Medium for most reviews. Reserve High for major investments, board discussions, regulatory reviews, or critical phase gates.

---

# Scoring

Score every risk across four dimensions.

**Likelihood:** H = more likely than not / M = possible / L = unlikely but real

**Impact:** H = project fails, launch blocked, major rework, regulatory exposure, or significant customer impact / M = delay, cost increase, reduced adoption, or operational burden / L = minor inconvenience

**Detectability:** Easy = clear leading indicators / Moderate = needs active monitoring / Hard = little or no warning before it triggers

**Velocity:** Fast = escalates in hours / Medium = days / Slow = weeks

**Priority from Likelihood × Impact:**

| | High Impact | Low Impact |
|---|---|---|
| High Likelihood | 🔴 Act now | 🟡 Monitor actively |
| Low Likelihood | 🟡 Prepare contingency | 🟢 Log and revisit |

Every Hard-detectability risk requires a trigger signal.

**Response types:** Mitigate / Transfer / Avoid / Accept / Escalate

A risk must be written as an event and consequence, not a topic.

Good:
- Third-party API rate limits prevent transaction processing during peak demand.

Bad:
- API risk
- Performance
- Dependencies

---

# Quality Checks

Before finalising the report:

- Every risk must be specific to the project context.
- Avoid generic risks that could apply to any project.
- Every 🔴 risk must have a named owner.
- Every Hard-detectability risk must include a trigger signal.
- Validation experiments must test a specific assumption.
- Decisions Needed should only include items requiring authority beyond the PM.
- Include product, customer, and adoption risks where relevant.
- If a major risk area cannot be evaluated, record it in Not Assessed.
- Prefer fewer high-quality risks over many generic risks.

Do not generate more than:
- 5 assumptions
- 8 risks (Medium)
- 12 risks (High)
- 5 decisions
- 5 unknowns

---

# Output Format

## RISK ANALYSIS

**Project:** [Name] | **Phase:** [Phase] | **Date:** [Today]

**Depth:** Low / Medium / High | **Recent changes assessed:** Yes / No

---

### Overall Verdict

Risk Level: 🔴 High / 🟡 Medium / 🟢 Low

Recommendation:
- Proceed
- Proceed with Conditions
- Escalate
- Pause


Conditions:
[List only for Proceed with Conditions]

[2-3 sentences covering dominant risk theme, project health, and rationale.]

---

### Key Assumptions
*(Medium/High depth only)*

| Assumption | Confidence | Risk if Wrong |
|---|---|---|
| [Statement] | High/Medium/Low | [Consequence] |

Maximum 5 assumptions.

---

### Top Risk Snapshot
*(Low depth only)*

1. [Most significant risk]
2. [Second most significant risk]
3. [Third most significant risk]

Maximum 3 items.

---

### Risk Register

| # | Risk | Category | Likelihood | Impact | Priority | Detectability | Velocity | Response | Owner | Proximity |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 | [Event - not a label] | Product/Customer/Adoption/Delivery/Technical/Security/Compliance/Operational/Dependency/Stakeholder/Business | H/M/L | H/M/L | 🔴/🟡/🟢 | Easy/Moderate/Hard | Fast/Medium/Slow | [Type] | [Role] | [Week 1-2 / Month 1 / Later] |

---

### Top Risks - Detail
*(Every 🔴 risk; if none, top 2 🟡)*

**R[N] - [Name]**

- What could happen: [Specific bad outcome]
- Root cause: [Underlying reason]
- Why exposed: [Project-specific context]
- Trigger signal: [Observable event]
- Velocity: [How quickly it escalates]
- Risk score: [Qualitative summary]
- Action: [Who does what by when]


---

### Stakeholder Summary
*(Medium/High depth only)*

> "We are at risk of [outcome] due to [cause]. Recommended action: [next step]."

Summarise the major themes, trade-offs, and leadership implications.

Do not simply repeat risks.

Summarise themes, trade-offs, and leadership implications.

---

### Prioritisation Reasoning
*(High depth only)*

Explain why top risks are ranked as they are, especially where detectability or velocity elevates priority.

---

### Decisions Needed

| Decision | Owner | By | Impact if Delayed |
|---|---|---|---|
| [Requires authority above PM] | [Role] | [Date] | [Delivery / Cost / Compliance / Launch impact] |

---

### Not Assessed

Rank unknowns by potential impact.

**Critical Unknowns**
- [Area and reason]

**Secondary Unknowns**
- [Area and reason]

---

### Optional Next Step

This analysis can be visualised as an executive dashboard showing:

- Risk Heatmap (Likelihood × Impact)
- Risk Timeline (Urgency View)
- Risk Category Distribution
- Executive Summary Cards

> Would you like me to create this dashboard?

If the user agrees, invoke the `visualisation` skill using the completed risk analysis as input.