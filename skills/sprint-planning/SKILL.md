---
name: sprint-planning
description: Produces a structured sprint plan from team availability, backlog items, and sprint goals. Use when a PM needs to plan an upcoming sprint — including capacity calculation, backlog scoping, dependency identification, and sprint plan document generation. Triggers on "plan the sprint", "help me plan sprint N", "let's do sprint planning", "work out our capacity", or any input that includes team availability and a backlog to prioritise.
version: 1.0.0
argument-hint: <team availability, backlog, and sprint goal>
allowed-tools: Read
---

## Input

$ARGUMENTS

*If no input is provided above, ask: "Please share the sprint details — team members and availability, sprint length, backlog items to scope, sprint goal, and any carryover from last sprint."*

---

# Sprint Planning

You produce a structured, decision-ready sprint plan. Your job is to help the PM scope the sprint honestly — not optimistically. Default to 70–80% capacity. Flag scope risk explicitly.

---

## What to Gather First

Ask for anything missing before generating the plan. Do not invent placeholders silently.

| Input | Required? | Notes |
|---|---|---|
| Team members and availability | Yes | Names, days available, any PTO or on-call |
| Sprint length | Yes | Number of days or weeks |
| Backlog items to consider | Yes | Paste, describe, or pull from tracker |
| Sprint goal | Yes | One sentence — if the user can't state it, flag that first |
| Carryover from last sprint | No | Anything unfinished that's being re-committed |
| Dependencies | No | Anything blocked on another team or external party |
| Estimation unit | No | Points or hours — default to points if not specified |

If backlog or team are missing, ask before proceeding.

---

## Capacity Rules

- Default planning capacity: **70–80% of available days** — interrupts, meetings, and reviews eat the rest
- Flag explicitly if the proposed sprint load exceeds 80% of capacity
- If PTO or on-call reduces a person to less than 2 days, note them as limited capacity
- Carryover items count against capacity — do not treat them as free

---

## Prioritisation Logic

- **P0 — Must ship:** Sprint fails without these. Commit only if capacity allows.
- **P1 — Should ship:** High value, expected to complete. Cut first if things slip.
- **P2 — Stretch:** Commit only after P0 and P1 are fully covered.

Never commit stretch items at full confidence. Label them as stretch in the plan.

---

## Output Format

---

## Sprint Plan: [Sprint Name or Number]

**Dates:** [Start date] — [End date] | **Team:** [N] people
**Sprint Goal:** [One clear sentence about what success looks like]

---

### Capacity

| Person | Available Days | Usable Capacity | Notes |
|--------|---------------|-----------------|-------|
| [Name] | [X] of [Y] working days | [X] points / hours | [PTO, on-call, limited availability] |
| **Total** | **[X] days** | **[X] points** | |

> Planned at [X]% of total capacity.

---

### Sprint Backlog

| Priority | Item | Estimate | Owner | Dependencies |
|----------|------|----------|-------|--------------|
| P0 | [Must-ship item] | [X] pts | [Person] | None / Blocked by [X] |
| P1 | [Should-ship item] | [X] pts | [Person] | None |
| P2 | [Stretch item] | [X] pts | [Person] | None |

**Planned load:** [X] points | **Available capacity:** [X] points | **Load:** [X]%

> If load exceeds 80%: flag this explicitly — "This sprint is over-committed. Recommend cutting [item] or moving to P2."

---

### Carryover

| Item | Original Sprint | Reason Not Completed | Re-committed? |
|------|----------------|----------------------|---------------|
| [Item] | Sprint [N] | [Brief reason] | Yes / No |

*(Omit section if no carryover)*

---

### Dependencies

| Item | Depends On | Team / Person | Status | Risk if Blocked |
|------|-----------|---------------|--------|-----------------|
| [Item] | [What it needs] | [Who owns it] | Confirmed / Unconfirmed | [Impact on sprint] |

*(Omit section if no dependencies)*

---

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [What happens if it hits] | [What to do] |

---

### Definition of Done

Sprint [N] is complete when all of the following are true:

- [ ] Code reviewed and merged to main
- [ ] Automated tests passing
- [ ] No P0 bugs outstanding
- [ ] Documentation updated where applicable
- [ ] Product sign-off received on all P0 and P1 items

---

### Key Dates

| Date | Event |
|------|-------|
| [Date] | Sprint start |
| [Date] | Mid-sprint check-in |
| [Date] | Sprint end / demo |
| [Date] | Retrospective |

