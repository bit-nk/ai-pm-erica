# Golden case - triage

## Input

```
/triage
Client Slack: "The reporting dashboard needs to show real-time data. The exec
team presents to the board next month and the current refresh rate is
embarrassing. Budget's tight but this is a priority."
```

## Must contain

The output must be a **Requirement Intake Summary** with every section populated:

- [ ] Request Summary
- [ ] Likely Business Goal
- [ ] Primary User / Stakeholder Need
- [ ] What Is Clear
- [ ] Missing Information (must flag at least: what "real-time" means, exact board date, budget figure)
- [ ] Risks / Concerns
- [ ] Intake Classification
- [ ] Recommended Next Step (a concrete next action, not "do more analysis")

## Must NOT do

- [ ] Must not produce a charter, PRD, or stories - triage only
- [ ] Must not invent a budget figure or a specific date that wasn't given
