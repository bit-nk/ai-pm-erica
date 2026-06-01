import { TEST_DATA, type StepValues } from "./steps";

/** A seeded record (no id; the store assigns one). */
export interface SeedRecord { title: string; date: string; values: StepValues }

/**
 * Two mock records per multi-record skill, so the record list is populated out
 * of the box. Record one reuses the Finwave scenario seed; record two is a
 * second, distinct entry.
 */
export const RECORD_SEEDS: Record<string, SeedRecord[]> = {
  "sprint-planning": [
    { title: "Sprint 1 plan", date: "2026-06-09", values: TEST_DATA["sprint-planning"] },
    { title: "Sprint 2 plan", date: "2026-06-23", values: {
      team: [
        { person: "Marcus (BE)", points: "13" },
        { person: "Aiko (BE)", points: "13" },
        { person: "Lin (FE)", points: "8" },
        { person: "Priya (QA)", points: "5" },
      ],
      backlog: [
        { priority: "P0", item: "NOTIF-7 Webhook delivery service", points: "8" },
        { priority: "P0", item: "NOTIF-8 Webhook retry + signing", points: "5" },
        { priority: "P1", item: "NOTIF-9 Recipient management UI", points: "5" },
        { priority: "P2", item: "NOTIF-10 Notification history", points: "3" },
      ],
    }},
  ],
  "sprint-report": [
    { title: "Sprint 1 report", date: "2026-06-18", values: TEST_DATA["sprint-report"] },
    { title: "Sprint 2 report", date: "2026-07-01", values: {
      sprint: "Sprint 2 - Webhooks",
      day: "9", totalDays: "10", status: "green", confidence: "88",
      committed: "18", completed: "16",
      forecast: "All P0/P1 complete; NOTIF-10 carried to backlog.",
      topRisks: [{ risk: "Load test for webhook signing still pending" }],
    }},
  ],
  "release-checklist": [
    { title: "Notifications v1 release", date: "2026-07-03", values: TEST_DATA["release-checklist"] },
    { title: "Webhooks v1.1 release", date: "2026-07-17", values: {
      items: [
        { category: "Feature Readiness", item: "Webhook delivery + retry Done", status: "PASS" },
        { category: "Testing", item: "QA sign-off on webhooks", status: "PASS" },
        { category: "Testing", item: "Load test at peak volume", status: "RISK" },
        { category: "Operational Readiness", item: "Rollback runbook reviewed", status: "PASS" },
        { category: "Approvals", item: "PM + Sponsor sign-off", status: "PASS" },
      ],
    }},
  ],
  "decision-log": [
    { title: "Webhook scope change", date: "2026-06-20", values: TEST_DATA["decision-log"] },
    { title: "History deferred to Q3", date: "2026-06-28", values: {
      project: "Finwave Real-Time Notifications",
      entries: [{
        area: "Timeline",
        originalPlan: "Notification history in Sprint 2 stretch",
        revisedPlan: "Notification history moved to Q3",
        reason: "Webhook delivery took priority for the conference",
        changeStatus: "Approved",
        changeApprovedBy: "Sarah Chen",
      }],
    }},
  ],
  "meeting-notes": [
    { title: "Notifications discovery kick-off", date: "2026-06-01", values: TEST_DATA["meeting-notes"] },
    { title: "Sprint 1 review", date: "2026-06-18", values: {
      title: "Sprint 1 review",
      date: "2026-06-18",
      attendees: ["Sarah Chen", "Marcus Reid", "Priya Sharma", "PM"],
      agenda: [{ item: "Demo notification engine" }, { item: "Review NOTIF-6 blocker" }, { item: "Plan Sprint 2" }],
      notes: [
        { note: "Email notifications demoed end to end within the 60s target." },
        { note: "NOTIF-6 unblocked after Redis region fix." },
      ],
      decisions: [{ decision: "Proceed with webhook delivery in Sprint 2" }],
      actions: [
        { who: "Marcus", what: "Spike webhook signing approach", when: "2026-06-20" },
        { who: "PM", what: "Update roadmap and SOW for Sprint 2", when: "2026-06-19" },
      ],
    }},
  ],
  "tech-review": [
    { title: "Notification engine review", date: "2026-06-04", values: TEST_DATA["tech-review"] },
    { title: "Webhook delivery review", date: "2026-06-21", values: {
      summary: "Outbound webhook service with HMAC signing, exponential-backoff retries, and a dead-letter queue for failed deliveries.",
      implications: [
        { item: "Reuses the notification service; ~5 days build" },
        { item: "Needs a per-client signing secret store" },
      ],
      risks: [
        { risk: "Client endpoints may be slow or down", likelihood: "M", impact: "M" },
        { risk: "Replay protection on the signing scheme", likelihood: "L", impact: "H" },
      ],
      questions: [
        { question: "Where are per-client signing secrets stored?" },
        { question: "What is the retry ceiling before dead-lettering?" },
      ],
      verdict: "Feasible - confirm secret storage before build.",
    }},
  ],
  retrospective: [
    { title: "Sprint 1 retro", date: "2026-06-19", values: TEST_DATA.retrospective },
    { title: "Sprint 2 retro", date: "2026-07-02", values: {
      sprint: "Sprint 2",
      wentWell: [{ item: "Webhook spike de-risked the build" }, { item: "Zero carryover on P0 items" }],
      didnt: [{ item: "Load testing slipped again" }],
      actions: [{ action: "Book load-test window in Sprint 3 planning", owner: "PM" }],
    }},
  ],
  "stakeholder-update": [
    { title: "Week 1 update", date: "2026-06-13", values: TEST_DATA["stakeholder-update"] },
    { title: "Week 3 update", date: "2026-06-27", values: {
      audience: "Sarah Chen (Sponsor)",
      headline: "Email MVP shipped to staging; webhooks on track for the conference.",
      progress: [
        { item: "Notification engine live in staging" },
        { item: "Webhook delivery service in build" },
      ],
      risks: [{ risk: "Load testing not yet scheduled" }],
      asks: [{ ask: "Confirm conference demo date and environment" }],
    }},
  ],
};
