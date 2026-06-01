import type { OnbData } from "@/components/onboarding/steps";

/**
 * Pre-built orchestration for Acme Corp / Invoice Portal Rebuild. Seeded into
 * the store as an already-completed project so the dashboard ships with a
 * second, fully worked example (no need to run the orchestrator).
 */
export const ACME_DATA: OnbData = {
  triage: {
    requestSummary: "Acme's legacy invoice portal is slow, unsupported, and blocks self-serve. Finance wants a rebuilt portal where enterprise customers download invoices, dispute line items, and pay online.",
    businessGoal: "Cut invoice-related support tickets and speed up collections by giving customers a modern self-serve portal.",
    stakeholderNeed: "Finance and customers need reliable self-serve invoice access, disputes, and payment.",
    whatIsClear: [
      { point: "Audience: enterprise finance users" },
      { point: "Replace the legacy portal, not extend it" },
      { point: "Must integrate with the existing billing system" },
    ],
    missingInfo: [
      { point: "Which payment providers must be supported?" },
      { point: "Is SSO required at launch?" },
      { point: "Data migration scope for historical invoices?" },
    ],
    concerns: [
      { point: "Legacy billing API is poorly documented" },
      { point: "Historical data quality is unknown" },
    ],
    classification: "Rebuild - High complexity",
    nextStep: "Run a discovery session with Finance and the billing platform team.",
  },
  "risk-scan": {
    risks: [
      { risk: "Legacy billing API undocumented / unstable", likelihood: "H", impact: "H", priority: "Act now", owner: "Tech Lead" },
      { risk: "Historical invoice data quality poor", likelihood: "M", impact: "H", priority: "Contingency", owner: "Data" },
      { risk: "Payment provider integration scope creep", likelihood: "M", impact: "M", priority: "Monitor", owner: "PM" },
      { risk: "SSO requirement surfaces late", likelihood: "M", impact: "M", priority: "Monitor", owner: "PM" },
    ],
  },
  charter: {
    sponsor: "VP Finance, Acme Corp",
    objectives: [
      { objective: "Self-serve invoice download and search" },
      { objective: "Online dispute and payment" },
      { objective: "Reduce invoice support tickets by 50%" },
    ],
    outOfScope: [{ item: "Mobile app" }, { item: "Procurement workflows" }, { item: "Multi-currency (phase 2)" }],
  },
  discovery: {
    unknowns: [
      { unknown: "Billing API capabilities and rate limits" },
      { unknown: "Historical data migration volume" },
      { unknown: "Payment providers in scope" },
    ],
    attendees: ["VP Finance", "Billing Platform Lead", "PM", "Security"],
  },
  prd: {
    goals: [
      { goal: "Fast self-serve invoice access", metric: "Portal load time", target: "< 2s" },
      { goal: "Reduce support load", metric: "Invoice tickets", target: "-50% in 90 days" },
    ],
    functional: [
      { requirement: "Search and download invoices (PDF)", priority: "Must" },
      { requirement: "Raise and track a dispute on a line item", priority: "Must" },
      { requirement: "Pay an invoice online", priority: "Must" },
      { requirement: "SSO login", priority: "Should" },
    ],
  },
  stories: {
    epics: [
      { name: "Invoice Access", stories: [
        { title: "Invoice search and list", points: "5", status: "To Do" },
        { title: "Invoice PDF download", points: "3", status: "To Do" },
      ]},
      { name: "Disputes & Payments", stories: [
        { title: "Raise a dispute on a line item", points: "8", status: "To Do" },
        { title: "Online payment via provider", points: "8", status: "To Do" },
      ]},
    ],
  },
  "sprint-sow": {
    sprintGoal: "Ship invoice access (search, list, download) to staging",
    deliverables: [{ deliverable: "Billing API adapter" }, { deliverable: "Invoice list and search UI" }, { deliverable: "PDF download service" }],
  },
  "sprint-planning": {
    team: [
      { person: "Dev A (BE)", points: "13" },
      { person: "Dev B (FE)", points: "13" },
      { person: "Dev C (FE)", points: "8" },
      { person: "QA", points: "5" },
    ],
    backlog: [
      { priority: "P0", item: "Billing API adapter", points: "8" },
      { priority: "P0", item: "Invoice list and search", points: "5" },
      { priority: "P1", item: "Invoice PDF download", points: "3" },
      { priority: "P2", item: "Saved searches", points: "3" },
    ],
  },
  roadmap: {
    goal: "Replace the legacy invoice portal in two sprints",
    horizon: "Next 8 weeks",
    weeks: "8",
    tasks: [
      { name: "Discovery + API spike", lane: "Sprint 0", startWeek: "1", endWeek: "1" },
      { name: "Invoice access", lane: "Sprint 1", startWeek: "2", endWeek: "4" },
      { name: "Disputes", lane: "Sprint 2", startWeek: "5", endWeek: "6" },
      { name: "Payments + launch", lane: "Sprint 2", startWeek: "7", endWeek: "8" },
    ],
  },
  "budget-tracker": {
    project: "Acme Invoice Portal Rebuild",
    budget: "120000",
    developers: [
      { name: "Dev A (BE)", hours: "200", rate: "120" },
      { name: "Dev B (FE)", hours: "200", rate: "110" },
      { name: "Dev C (FE)", hours: "120", rate: "100" },
      { name: "QA", hours: "140", rate: "90" },
    ],
  },
};
