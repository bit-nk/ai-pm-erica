# Golden case - release-checklist

## Input

```
/release-checklist
Release: Sprint 22 - Invoicing v2
Type: Planned sprint release
Date: Friday 30 May 2026, 6:00 PM AEST
Tickets: FIN-441, FIN-442, FIN-443
QA sign-off received for FIN-441 and FIN-442. FIN-443 still in testing.
No load testing done. Rollback plan exists but unreviewed.
```

## Must contain

- [ ] All 7 categories present (Feature Readiness, Testing, Operational Readiness, Communications, Dependencies, Approvals, Post-Release Readiness)
- [ ] Every checklist item has a status: PASS / FAIL / RISK / N/A / UNCONFIRMED
- [ ] A Summary table with per-category and total counts
- [ ] A Blockers section listing FAIL/UNCONFIRMED items with owners
- [ ] Exactly one Verdict: GO, NO-GO, or CONDITIONAL GO

## Expected judgement (fallback path - no Jira connected)

- [ ] FIN-443 in testing → Feature Readiness FAIL or RISK (not PASS)
- [ ] No load testing → RISK
- [ ] Rollback plan unreviewed → UNCONFIRMED or RISK
- [ ] Verdict should be CONDITIONAL GO or NO-GO - never GO with these open
- [ ] Must not fabricate Jira statuses it wasn't given
