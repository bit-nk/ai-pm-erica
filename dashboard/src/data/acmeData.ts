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
      { risk: "Legacy billing API undocumented / unstable", category: "Technical", likelihood: "H", impact: "H", detectability: "Hard", velocity: "Fast", priority: "Act now", response: "Escalate", owner: "Tech Lead" },
      { risk: "Historical invoice data quality poor", category: "Technical", likelihood: "M", impact: "H", detectability: "Moderate", velocity: "Slow", priority: "Contingency", response: "Mitigate", owner: "Data" },
      { risk: "Payment provider integration scope creep", category: "Business", likelihood: "M", impact: "M", detectability: "Moderate", velocity: "Medium", priority: "Monitor", response: "Mitigate", owner: "PM" },
      { risk: "SSO requirement surfaces late", category: "Stakeholder", likelihood: "M", impact: "M", detectability: "Moderate", velocity: "Slow", priority: "Monitor", response: "Accept", owner: "PM" },
    ],
  },
  charter: {
    purpose: "Acme's legacy invoice portal is slow and unsupported. This project rebuilds it so enterprise customers can self-serve invoice access, disputes, and payment.",
    sponsor: "VP Finance, Acme Corp",
    inScope: [{ item: "Invoice search and download" }, { item: "Online dispute and payment" }],
    objectives: [
      { objective: "Self-serve invoice download and search" },
      { objective: "Online dispute and payment" },
      { objective: "Reduce invoice support tickets by 50%" },
    ],
    outOfScope: [{ item: "Mobile app" }, { item: "Procurement workflows" }, { item: "Multi-currency (phase 2)" }],
  },
  discovery: {
    problem: "The legacy invoice portal is unsupported and blocks self-serve, driving avoidable support volume and slow collections.",
    success: "Enterprise customers self-serve invoice access, disputes, and payment without contacting support.",
    unknowns: [
      { unknown: "Billing API capabilities and rate limits" },
      { unknown: "Historical data migration volume" },
      { unknown: "Payment providers in scope" },
    ],
    attendees: ["VP Finance", "Billing Platform Lead", "PM", "Security"],
  },
  prd: {
    background: "Rebuild the enterprise invoice portal on the existing billing system, prioritising self-serve access, disputes, and online payment.",
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
        {
          title: "Invoice search and list", points: "5", status: "To Do",
          asA: "finance user", iWant: "search and browse my invoices", soThat: "I can find any invoice without calling support",
          criteria: "Given the invoice list, then invoices are shown newest first with number, date, amount and status\nGiven a search term, then results filter to matching invoice numbers\nGiven zero results, then show \"No invoices match your search\"",
        },
        {
          title: "Invoice PDF download", points: "3", status: "To Do",
          asA: "finance user", iWant: "download an invoice as PDF", soThat: "I can file it",
          criteria: "Given an invoice, when I click Download, then a PDF downloads within 3 seconds\nError: if generation fails, show \"Could not generate the PDF, please try again\"",
        },
      ]},
      { name: "Disputes & Payments", stories: [
        {
          title: "Raise a dispute on a line item", points: "8", status: "To Do",
          asA: "finance user", iWant: "dispute a specific line item", soThat: "billing errors are corrected",
          criteria: "Given a line item, when I raise a dispute with a reason, then its status becomes \"Disputed\"\nGiven no reason entered, then show \"Please add a reason for the dispute\"",
        },
        {
          title: "Online payment via provider", points: "8", status: "To Do",
          asA: "finance user", iWant: "pay an invoice online", soThat: "I avoid bank transfers",
          criteria: "Given an unpaid invoice, when payment succeeds, then status becomes \"Paid\" and a receipt is emailed\nGiven a declined card, then show the provider message and keep the invoice unpaid",
        },
      ]},
    ],
  },
  "sprint-sow": {
    sprintGoal: "Ship invoice access (search, list, download) to staging",
    overview: "Sprint 1 builds the billing API adapter and the invoice access surface. Disputes and payments follow in later sprints.",
    deliverables: [
      { deliverable: "Billing API adapter", description: "Reads invoices from the billing system", assignee: "Dev A" },
      { deliverable: "Invoice list and search UI", description: "Search, list, filter invoices", assignee: "Dev B" },
      { deliverable: "PDF download service", description: "Generates invoice PDFs", assignee: "Dev C" },
    ],
  },
  "sprint-planning": {
    team: [
      { person: "Dev A (BE)", availableDays: "10", points: "13", notes: "Full availability" },
      { person: "Dev B (FE)", availableDays: "10", points: "13", notes: "" },
      { person: "Dev C (FE)", availableDays: "8", points: "8", notes: "2 days on support" },
      { person: "QA", availableDays: "10", points: "5", notes: "QA, not story points" },
    ],
    backlog: [
      { priority: "P0", item: "Billing API adapter", points: "8", owner: "Dev A", dependencies: "API access from platform" },
      { priority: "P0", item: "Invoice list and search", points: "5", owner: "Dev B" },
      { priority: "P1", item: "Invoice PDF download", points: "3", owner: "Dev C" },
      { priority: "P2", item: "Saved searches", points: "3", owner: "Dev C" },
    ],
  },
  roadmap: {
    goal: "Replace the legacy invoice portal in two sprints",
    horizon: "Next 8 weeks",
    weeks: "8",
    tasks: [
      { name: "Discovery + API spike", lane: "Sprint 0", startWeek: "1", endWeek: "1", startDate: "2026-06-01", endDate: "2026-06-05" },
      { name: "Invoice access", lane: "Sprint 1", startWeek: "2", endWeek: "4", startDate: "2026-06-08", endDate: "2026-06-26" },
      { name: "Disputes", lane: "Sprint 2", startWeek: "5", endWeek: "6", startDate: "2026-06-29", endDate: "2026-07-10" },
      { name: "Payments + launch", lane: "Sprint 2", startWeek: "7", endWeek: "8", startDate: "2026-07-13", endDate: "2026-07-24" },
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
