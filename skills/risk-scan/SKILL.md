---
name: risk-scan
description: Identifies, evaluates, and recommends mitigation strategies for project risks across any phase of delivery. Use whenever a PM needs continuous risk discovery or decision support — including when someone says "analyse the risks on this project", "do a full risk analysis", "we need a risk review", "what risks should I be tracking right now", "update the risk picture", or shares project context and wants a structured risk assessment. Unlike the initial pre-screen (pm-initial-risk-scan), this skill is designed for ongoing use across all project phases — Discovery through Deployment — and adjusts depth based on how much time the PM has. Use it at any phase gate, after significant scope changes, or when the risk landscape feels unclear.
version: 1.0.0
argument-hint: <project context, phase, and known risks>
allowed-tools: Read
---

## Input

$ARGUMENTS

*If no input is provided above, ask: "Please share the project context — name, phase, timeline, known risks, and any recent changes."*

---

# Before Starting — What to Gather

Extract or ask for these before writing anything:

| Input | Required? | Why |
|---|---|---|
| Project context | Yes | Scope, timeline, stakeholders, goals — without this, risks are generic |
| Current phase | Yes | Risk profile changes by phase — see phase table below |
| Known constraints | No | Fixed deadlines, budget caps — these turn risks into near-certainties |
| Recent changes | No | Scope, team, or requirement changes are a primary risk source |
| Depth needed | No | Default Medium — see depth table below |

If project context or current phase is missing, ask before proceeding.

---

# Depth

| Depth | When | Risks | Sections to include |
|---|---|---|---|
| Low | "quick", "brief" | 3–5 | Risk register + verdict only |
| Medium | default | 5–8 | Full output except Prioritisation Reasoning |
| High | "thorough", "board report" | 8–12 | Full output including Prioritisation Reasoning |

---

# Scoring

Score every risk across four dimensions — each one changes the response, not just the priority colour.

**Likelihood:** H = more likely than not / M = possible / L = unlikely but real

**Impact:** H = project fails or major rework / M = delay or cost increase / L = minor inconvenience

**Detectability:** Easy = clear leading indicators / Moderate = needs active monitoring / Hard = little or no warning before it triggers

**Velocity:** Fast = escalates in hours / Medium = days / Slow = weeks

**Priority from Likelihood × Impact:**

| | High Impact | Low Impact |
|---|---|---|
| **High Likelihood** | 🔴 Act now | 🟡 Monitor actively |
| **Low Likelihood** | 🟡 Prepare contingency | 🟢 Log and revisit |

Every Hard-detectability risk needs a **trigger signal** — a specific observable event that tells you the risk has activated. Without one, nobody knows when to act.

**Response types:** Mitigate / Transfer / Avoid / Accept / Escalate. "Monitor" alone is not a response.

---

# Output Format

---

## RISK ANALYSIS

**Project:** [Name] | **Phase:** [Phase] | **Date:** [Today]
**Depth:** Low / Medium / High | **Recent changes assessed:** Yes / No

---

### Overall Verdict

🔴 High / 🟡 Medium / 🟢 Low

[2–3 sentences: dominant risk theme, whether the project is healthy for its current phase, what needs to change if not.]

---

### Risk Register

| # | Risk | Category | Likelihood | Impact | Priority | Detectability | Velocity | Response | Owner | Proximity |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 | [Event — not a label] | Delivery/Technical/Stakeholder/Business | H/M/L | H/M/L | 🔴/🟡/🟢 | Easy/Moderate/Hard | Fast/Medium/Slow | [Type] | [Role] | [Week 1–2/Month 1/Later] |

---

### Top Risks — Detail
This should be in table format. 
*(every 🔴 risk; if none, top 2 🟡)*

**R[N] — [Name]**
*What could happen:* [Specific bad outcome]
*Why exposed:* [What makes this real for this project]
*Trigger signal:* [Observable event that confirms the risk has activated — required for Hard detectability]
*Velocity:* [How fast it escalates and why]
*Risk score:* [Qualitative one-liner]
*Action:* [Who does what by when]

---

### Validation Experiments
*(Medium/High depth only — High-impact risks where the outcome is genuinely uncertain)*

| Risk | Experiment | What We're Testing | Expected Learning | By |
|---|---|---|---|---|
| [Name] | Spike/Prototype/Pilot/Data pull | [Assumption being tested] | [What we'll know] | [Hard date] |

---

### Stakeholder Summary
*(Medium/High depth — written for sponsor, not PM)*

> "We are at risk of [outcome] due to [cause]. Recommended action: [next step]."

One line per top risk. Plain language. No jargon.

---

### Prioritisation Reasoning
*(High depth only)*

Explain why top risks are ranked as they are — especially where velocity or detectability overrides a lower probability score.

---

### Decisions Needed

| Decision | Owner | By |
|---|---|---|
| [Requires authority above PM] | [Role] | [Date] |

---

### Not Assessed

- [Area — why it couldn't be evaluated from available information]

