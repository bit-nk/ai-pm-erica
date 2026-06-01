/** Structured onboarding schema: scalars, tag inputs, list rows, and epic groups. */

/** Skills that hold a collection of records (multiple meetings, sprints, etc.). */
export const MULTI_RECORD_SKILLS: string[] = [
  "meeting-notes", "tech-review", "retrospective", "stakeholder-update",
  "decision-log", "release-checklist", "sprint-report", "sprint-planning",
];
/** Multi-record skills whose records can be exported to Word/PDF from the list. */
export const EXPORTABLE_SKILLS: string[] = [
  "meeting-notes", "tech-review", "retrospective", "stakeholder-update", "decision-log",
];
/** Singular noun + default record title prefix per multi-record skill. */
export const RECORD_NOUN: Record<string, string> = {
  "meeting-notes": "Meeting",
  "tech-review": "Tech review",
  retrospective: "Retro",
  "stakeholder-update": "Update",
  "decision-log": "Decision log",
  "release-checklist": "Release",
  "sprint-report": "Sprint report",
  "sprint-planning": "Sprint plan",
};

export type Row = Record<string, string>;
export interface EpicGroup { name: string; stories: Row[] }
export type StepValues = Record<string, string | string[] | Row[] | EpicGroup[]>;
export type OnbData = Record<string, StepValues>;

export interface ScalarField {
  name: string;
  label: string;
  kind: "text" | "textarea" | "select" | "tags";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}
export interface ListField {
  name: string;
  label: string;
  kind: "list";
  addLabel: string;
  required?: boolean;
  itemFields: ScalarField[];
}
export interface EpicsField {
  name: string;
  label: string;
  kind: "epics";
  required?: boolean;
  storyFields: ScalarField[];
}
export type StepField = ScalarField | ListField | EpicsField;

export interface OnbStep {
  id: string;
  title: string;
  intro: string;
  fields: StepField[];
}

const HML = ["H", "M", "L"];
const POINTS = ["1", "2", "3", "5", "8", "13", "21"]; // 7 selections
const STORY_STATUS = ["To Do", "In Progress", "Done"];
const PRIORITY = ["P0", "P1", "P2"];
const RISK_PRIORITY = ["Act now", "Monitor", "Contingency", "Log"];
const MOSCOW = ["Must", "Should", "Could"];
const CHECK_STATUS = ["PASS", "RISK", "FAIL", "UNCONFIRMED", "N/A"];
const CATEGORIES = [
  "Feature Readiness", "Testing", "Operational Readiness",
  "Communications", "Dependencies", "Approvals", "Post-Release Readiness",
];
const RAG = ["green", "amber", "red"];
const WEEKS = ["4", "6", "8", "10", "12"];
const WEEKNUM = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const DECISION_AREA = ["Scope", "Timeline", "Budget", "Architecture", "Team", "Process", "Other"];
const CHANGE_STATUS = ["Proposed", "Under Review", "Approved", "Rejected"];

export const STEPS: OnbStep[] = [
  { id: "triage", title: "Triage", intro: "Structure the raw request.", fields: [
    { name: "requestSummary", label: "Request summary", kind: "textarea", required: true },
    { name: "businessGoal", label: "Likely business goal", kind: "textarea", required: true },
    { name: "stakeholderNeed", label: "Primary stakeholder need", kind: "textarea" },
    { name: "whatIsClear", label: "What is clear", kind: "list", addLabel: "Add point", itemFields: [
      { name: "point", label: "Point", kind: "text", placeholder: "Something we already know" },
    ]},
    { name: "missingInfo", label: "Missing information", kind: "list", addLabel: "Add question", itemFields: [
      { name: "point", label: "Question", kind: "text", placeholder: "Something to clarify" },
    ]},
    { name: "concerns", label: "Risks / concerns", kind: "list", addLabel: "Add concern", itemFields: [
      { name: "point", label: "Concern", kind: "text" },
    ]},
    { name: "classification", label: "Intake classification", kind: "text" },
    { name: "nextStep", label: "Recommended next step", kind: "textarea" },
  ]},
  { id: "risk-scan", title: "Risk Scan", intro: "List the early risks; likelihood and impact build the matrix.", fields: [
    { name: "risks", label: "Risks", kind: "list", addLabel: "Add risk", required: true, itemFields: [
      { name: "risk", label: "Risk", kind: "text", required: true, placeholder: "What could go wrong" },
      { name: "likelihood", label: "Likelihood", kind: "select", options: HML },
      { name: "impact", label: "Impact", kind: "select", options: HML },
      { name: "priority", label: "Priority", kind: "select", options: RISK_PRIORITY },
      { name: "owner", label: "Owner", kind: "text", placeholder: "Who owns it" },
    ]},
  ]},
  { id: "charter", title: "Charter", intro: "Formalise the project.", fields: [
    { name: "sponsor", label: "Sponsor", kind: "text", required: true },
    { name: "objectives", label: "Objectives", kind: "list", addLabel: "Add objective", required: true, itemFields: [
      { name: "objective", label: "Objective", kind: "text", placeholder: "A measurable outcome" },
    ]},
    { name: "outOfScope", label: "Out of scope", kind: "list", addLabel: "Add exclusion", itemFields: [
      { name: "item", label: "Excluded", kind: "text", placeholder: "What we are NOT doing" },
    ]},
  ]},
  { id: "discovery", title: "Discovery", intro: "What must we learn first?", fields: [
    { name: "unknowns", label: "Key unknowns", kind: "list", addLabel: "Add unknown", required: true, itemFields: [
      { name: "unknown", label: "Unknown", kind: "text", placeholder: "A question to resolve" },
    ]},
    { name: "attendees", label: "Attendees", kind: "tags", placeholder: "Type a name and press Enter" },
  ]},
  { id: "prd", title: "PRD", intro: "Document the requirements.", fields: [
    { name: "goals", label: "Goals", kind: "list", addLabel: "Add goal", required: true, itemFields: [
      { name: "goal", label: "Goal", kind: "text" },
      { name: "metric", label: "Metric", kind: "text" },
      { name: "target", label: "Target", kind: "text" },
    ]},
    { name: "functional", label: "Functional requirements", kind: "list", addLabel: "Add requirement", required: true, itemFields: [
      { name: "requirement", label: "Requirement", kind: "text" },
      { name: "priority", label: "Priority", kind: "select", options: MOSCOW },
    ]},
  ]},
  { id: "stories", title: "User Stories", intro: "Add epics; each holds its own stories.", fields: [
    { name: "epics", label: "Epics", kind: "epics", required: true, storyFields: [
      { name: "title", label: "Story", kind: "text", placeholder: "What the user can do" },
      { name: "points", label: "Points", kind: "select", options: POINTS },
      { name: "status", label: "Status", kind: "select", options: STORY_STATUS },
    ]},
  ]},
  { id: "sprint-sow", title: "Sprint SOW", intro: "Scope the first sprint.", fields: [
    { name: "sprintGoal", label: "Sprint goal", kind: "text", required: true },
    { name: "deliverables", label: "Deliverables", kind: "list", addLabel: "Add deliverable", required: true, itemFields: [
      { name: "deliverable", label: "Deliverable", kind: "text" },
    ]},
  ]},
  { id: "sprint-planning", title: "Sprint Planning", intro: "Per-person capacity; committed load is P0 + P1.", fields: [
    { name: "team", label: "Team capacity", kind: "list", addLabel: "Add person", required: true, itemFields: [
      { name: "person", label: "Person", kind: "text", placeholder: "Name" },
      { name: "points", label: "Usable points", kind: "select", options: POINTS },
    ]},
    { name: "backlog", label: "Backlog", kind: "list", addLabel: "Add item", required: true, itemFields: [
      { name: "priority", label: "Priority", kind: "select", options: PRIORITY },
      { name: "item", label: "Item", kind: "text" },
      { name: "points", label: "Points", kind: "select", options: POINTS },
    ]},
  ]},
  { id: "release-checklist", title: "Release Checklist", intro: "Statuses roll up to a verdict.", fields: [
    { name: "items", label: "Checks", kind: "list", addLabel: "Add check", required: true, itemFields: [
      { name: "category", label: "Category", kind: "select", options: CATEGORIES },
      { name: "item", label: "Check", kind: "text" },
      { name: "status", label: "Status", kind: "select", options: CHECK_STATUS },
    ]},
  ]},
  { id: "sprint-report", title: "Sprint Report", intro: "Mid-sprint status snapshot.", fields: [
    { name: "sprint", label: "Sprint", kind: "text", required: true },
    { name: "day", label: "Day of sprint", kind: "text", placeholder: "e.g. 7" },
    { name: "totalDays", label: "Sprint length (days)", kind: "text", placeholder: "e.g. 10" },
    { name: "status", label: "RAG status", kind: "select", options: RAG },
    { name: "confidence", label: "Confidence (%)", kind: "text", placeholder: "0-100" },
    { name: "committed", label: "Committed points", kind: "text" },
    { name: "completed", label: "Completed points", kind: "text" },
    { name: "forecast", label: "Forecast", kind: "textarea" },
    { name: "topRisks", label: "Top risks / blockers", kind: "list", addLabel: "Add risk", itemFields: [
      { name: "risk", label: "Risk", kind: "text" },
    ]},
  ]},
  { id: "decision-log", title: "Decision Log", intro: "Record scope/plan changes with impact.", fields: [
    { name: "project", label: "Project", kind: "text" },
    { name: "entries", label: "Decisions", kind: "list", addLabel: "Add decision", required: true, itemFields: [
      { name: "area", label: "Area", kind: "select", options: DECISION_AREA },
      { name: "originalPlan", label: "Original plan", kind: "text" },
      { name: "revisedPlan", label: "Revised plan", kind: "text" },
      { name: "reason", label: "Reason", kind: "text" },
      { name: "changeStatus", label: "Status", kind: "select", options: CHANGE_STATUS },
      { name: "changeApprovedBy", label: "Approved by", kind: "text" },
    ]},
  ]},
  { id: "meeting-notes", title: "Meeting Minutes", intro: "Header, agenda, and notes - export-ready.", fields: [
    { name: "title", label: "Meeting title", kind: "text", required: true },
    { name: "date", label: "Date", kind: "text", placeholder: "YYYY-MM-DD" },
    { name: "attendees", label: "Attendees", kind: "tags", placeholder: "Type a name and press Enter" },
    { name: "agenda", label: "Agenda", kind: "list", addLabel: "Add agenda item", itemFields: [
      { name: "item", label: "Agenda item", kind: "text" },
    ]},
    { name: "notes", label: "Notes / discussion", kind: "list", addLabel: "Add note", itemFields: [
      { name: "note", label: "Description", kind: "textarea" },
    ]},
    { name: "decisions", label: "Decisions", kind: "list", addLabel: "Add decision", itemFields: [
      { name: "decision", label: "Decision", kind: "text" },
    ]},
    { name: "actions", label: "Action items", kind: "list", addLabel: "Add action", itemFields: [
      { name: "who", label: "Who", kind: "text" },
      { name: "what", label: "What", kind: "text" },
      { name: "when", label: "By when", kind: "text" },
    ]},
  ]},
  { id: "tech-review", title: "Tech Review", intro: "Feasibility, delivery risks, SA questions.", fields: [
    { name: "summary", label: "Plain-English summary", kind: "textarea", required: true },
    { name: "implications", label: "Delivery implications", kind: "list", addLabel: "Add implication", itemFields: [
      { name: "item", label: "Implication", kind: "text" },
    ]},
    { name: "risks", label: "Risks surfaced", kind: "list", addLabel: "Add risk", itemFields: [
      { name: "risk", label: "Risk", kind: "text" },
      { name: "likelihood", label: "Likelihood", kind: "select", options: HML },
      { name: "impact", label: "Impact", kind: "select", options: HML },
    ]},
    { name: "questions", label: "Questions for the SA", kind: "list", addLabel: "Add question", itemFields: [
      { name: "question", label: "Question", kind: "text" },
    ]},
    { name: "verdict", label: "Feasibility verdict", kind: "text" },
  ]},
  { id: "retrospective", title: "Retrospective", intro: "What went well, what didn't, owned actions.", fields: [
    { name: "sprint", label: "Sprint", kind: "text" },
    { name: "wentWell", label: "What went well", kind: "list", addLabel: "Add item", itemFields: [
      { name: "item", label: "Item", kind: "text" },
    ]},
    { name: "didnt", label: "What didn't", kind: "list", addLabel: "Add item", itemFields: [
      { name: "item", label: "Item", kind: "text" },
    ]},
    { name: "actions", label: "Actions", kind: "list", addLabel: "Add action", itemFields: [
      { name: "action", label: "Action", kind: "text" },
      { name: "owner", label: "Owner", kind: "text" },
    ]},
  ]},
  { id: "stakeholder-update", title: "Stakeholder Update", intro: "Audience-ready status comms.", fields: [
    { name: "audience", label: "Audience", kind: "text" },
    { name: "headline", label: "Headline", kind: "textarea", required: true },
    { name: "progress", label: "Progress", kind: "list", addLabel: "Add item", itemFields: [
      { name: "item", label: "Update", kind: "text" },
    ]},
    { name: "risks", label: "Risks / watch items", kind: "list", addLabel: "Add risk", itemFields: [
      { name: "risk", label: "Risk", kind: "text" },
    ]},
    { name: "asks", label: "Asks / next steps", kind: "list", addLabel: "Add ask", itemFields: [
      { name: "ask", label: "Ask", kind: "text" },
    ]},
  ]},
  { id: "roadmap", title: "Roadmap", intro: "Sprint/week timeline; tasks render as bars.", fields: [
    { name: "goal", label: "Goal", kind: "text", required: true },
    { name: "horizon", label: "Horizon", kind: "text", placeholder: "e.g. Next 8 weeks" },
    { name: "weeks", label: "Total weeks", kind: "select", options: WEEKS },
    { name: "tasks", label: "Tasks", kind: "list", addLabel: "Add task", required: true, itemFields: [
      { name: "name", label: "Task", kind: "text" },
      { name: "lane", label: "Sprint / lane", kind: "text", placeholder: "e.g. Sprint 1" },
      { name: "startWeek", label: "Start week", kind: "select", options: WEEKNUM },
      { name: "endWeek", label: "End week", kind: "select", options: WEEKNUM },
      { name: "startDate", label: "Start date", kind: "text", placeholder: "optional, e.g. 2026-06-09" },
      { name: "endDate", label: "End date", kind: "text", placeholder: "optional" },
    ]},
  ]},
  { id: "budget-tracker", title: "Budget Tracker", intro: "Developer costs mapped against the budget.", fields: [
    { name: "project", label: "Project", kind: "text" },
    { name: "budget", label: "Total approved budget", kind: "text", placeholder: "e.g. 80000" },
    { name: "developers", label: "Developers", kind: "list", addLabel: "Add developer", required: true, itemFields: [
      { name: "name", label: "Developer", kind: "text" },
      { name: "hours", label: "Hours", kind: "text" },
      { name: "rate", label: "Cost / hour", kind: "text" },
    ]},
  ]},
];

/** Pre-filled test data so every section is ready to view. */
export const TEST_DATA: OnbData = {
  triage: {
    requestSummary: "Enterprise clients discover failed payments reactively (via customer calls) rather than proactively. Sarah is asking for real-time payment failure notifications.",
    businessGoal: "Reduce client churn and support burden by giving enterprise customers visibility into payment failures before their end-customers complain.",
    stakeholderNeed: "Enterprise clients need to know about payment failures the moment they occur.",
    whatIsClear: [
      { point: "Trigger event: payment failure" },
      { point: "Audience: enterprise clients" },
      { point: "Deadline: 6 weeks (Salesforce conference)" },
      { point: "Budget: ~$80k" },
    ],
    missingInfo: [
      { point: "Channels (email / SMS / webhook / in-app)?" },
      { point: "Events beyond failures (partial, reversals, retries)?" },
      { point: "Who receives the notification?" },
      { point: "Existing infra to build on?" },
      { point: "Is 6 weeks for MVP or full feature?" },
    ],
    concerns: [
      { point: '"Real-time" undefined (30s vs 5min)' },
      { point: "6 weeks is aggressive" },
      { point: "$80k may not cover full scope" },
    ],
    classification: "New Feature - Medium/High complexity",
    nextStep: "Run a discovery session with Sarah and the tech lead.",
  },
  "risk-scan": {
    risks: [
      { risk: "6-week deadline unachievable for full scope", likelihood: "H", impact: "H", priority: "Act now", owner: "PM" },
      { risk: "Real-time needs event streaming infra not in place", likelihood: "M", impact: "H", priority: "Act now", owner: "Tech Lead" },
      { risk: "Notification channel scope expands mid-sprint", likelihood: "H", impact: "M", priority: "Monitor", owner: "PM" },
      { risk: "$80k budget insufficient if webhook infra needed", likelihood: "M", impact: "H", priority: "Contingency", owner: "PM" },
      { risk: "Per-client config complexity underestimated", likelihood: "M", impact: "M", priority: "Monitor", owner: "PM" },
    ],
  },
  charter: {
    sponsor: "Sarah Chen (Head of Product)",
    objectives: [{ objective: "Notify within 60s of a payment event" }, { objective: "Reduce payment-related support tickets by 40%" }],
    outOfScope: [{ item: "SMS and push notifications" }, { item: "Webhook delivery (phase 2)" }],
  },
  discovery: {
    unknowns: [{ unknown: "Notification channels (email / in-app?)" }, { unknown: "Who receives alerts per account" }, { unknown: "Data volume at peak" }],
    attendees: ["PM", "Tech lead", "QA lead", "Sponsor"],
  },
  prd: {
    goals: [{ goal: "Real-time failure alerts", metric: "Alert latency", target: "< 60s" }],
    functional: [
      { requirement: "Send email within 60s of payment_failed", priority: "Must" },
      { requirement: "Configurable recipients per account", priority: "Must" },
      { requirement: "Dedupe on event replay", priority: "Should" },
    ],
  },
  stories: {
    epics: [
      { name: "Payment Event Notification Engine", stories: [
        { title: "Consume payment events from Kafka", points: "5", status: "In Progress" },
        { title: "Send email via SendGrid", points: "5", status: "To Do" },
        { title: "Recipient lookup service", points: "3", status: "To Do" },
        { title: "Email templates", points: "2", status: "To Do" },
      ]},
      { name: "Notification Recipient Management", stories: [
        { title: "Account settings screen", points: "3", status: "To Do" },
      ]},
      { name: "Notification History (stretch)", stories: [
        { title: "Notification history endpoint", points: "3", status: "To Do" },
      ]},
    ],
  },
  "sprint-sow": {
    sprintGoal: "Ship the notification engine to staging",
    deliverables: [{ deliverable: "Kafka consumer" }, { deliverable: "SendGrid integration" }, { deliverable: "Recipient lookup service" }],
  },
  "sprint-planning": {
    team: [
      { person: "Marcus (BE)", points: "13" },
      { person: "Aiko (BE)", points: "13" },
      { person: "Priya (QA)", points: "8" },
      { person: "Lin (FE, 50%)", points: "5" },
    ],
    backlog: [
      { priority: "P0", item: "NOTIF-2 Kafka consumer", points: "5" },
      { priority: "P0", item: "NOTIF-3 SendGrid integration", points: "5" },
      { priority: "P1", item: "NOTIF-4 Recipient lookup", points: "3" },
      { priority: "P1", item: "NOTIF-5 Email templates", points: "2" },
      { priority: "P2", item: "NOTIF-6 History endpoint", points: "3" },
    ],
  },
  "release-checklist": {
    items: [
      { category: "Feature Readiness", item: "All in-scope stories Done", status: "FAIL" },
      { category: "Testing", item: "QA sign-off received", status: "RISK" },
      { category: "Operational Readiness", item: "Rollback plan reviewed", status: "UNCONFIRMED" },
      { category: "Approvals", item: "PM sign-off", status: "PASS" },
    ],
  },
  "sprint-report": {
    sprint: "Sprint 1 - Notifications",
    day: "7", totalDays: "10", status: "amber", confidence: "72",
    committed: "18", completed: "7",
    forecast: "4 of 5 items likely complete (NOTIF-6 at risk).",
    topRisks: [
      { risk: "NOTIF-6 blocked - Redis provisioned in wrong region" },
      { risk: "NOTIF-4 not started, P1 with no buffer" },
      { risk: "QA staging readiness for NOTIF-2 regression" },
    ],
  },
  "decision-log": {
    project: "Finwave Real-Time Notifications",
    entries: [
      {
        area: "Scope",
        originalPlan: "Webhook delivery in Phase 2 (post-MVP)",
        revisedPlan: "Webhook delivery moved into Sprint 2",
        reason: "Enterprise client request ahead of the Salesforce conference",
        changeStatus: "Approved",
        changeApprovedBy: "Sarah Chen",
      },
    ],
  },
  "meeting-notes": {
    title: "Notifications discovery kick-off",
    date: "2026-06-01",
    attendees: ["Sarah Chen", "Marcus Reid", "Priya Sharma", "PM"],
    agenda: [
      { item: "Confirm MVP scope" },
      { item: "Validate event streaming approach" },
      { item: "Agree definition of real-time" },
    ],
    notes: [
      { note: "Kafka event layer already exists and can be reused for payment events." },
      { note: "MVP is email only; in-app notification centre is a stretch goal." },
      { note: "Recipients are configured at the account level, not per user." },
    ],
    decisions: [
      { decision: "MVP = email notifications only" },
      { decision: "Real-time defined as within 60 seconds of the event" },
    ],
    actions: [
      { who: "Marcus", what: "Confirm Kafka consumer for payment events", when: "2026-06-03" },
      { who: "PM", what: "Update charter and circulate for sign-off", when: "2026-06-02" },
      { who: "Priya", what: "Define QA approach for delivery testing", when: "2026-06-05" },
    ],
  },
  "tech-review": {
    summary: "Kafka event bus to a new notification microservice, emails via SendGrid, Redis to prevent duplicate sends, feature flag for per-client rollout.",
    implications: [
      { item: "6 weeks feasible for email only - Kafka already in place" },
      { item: "Redis deduplication adds ~3 days not in the original estimate" },
      { item: "SendGrid API key needed in prod before Week 3" },
    ],
    risks: [
      { risk: "Redis not in current prod stack", likelihood: "M", impact: "H" },
      { risk: "SendGrid rate limits under peak volume", likelihood: "L", impact: "M" },
    ],
    questions: [
      { question: "Is Redis already provisioned in prod?" },
      { question: "Does the SendGrid tier support enterprise volume?" },
      { question: "How does the feature flag interact with account settings?" },
    ],
    verdict: "Feasible with conditions - resolve Redis provisioning before Week 3.",
  },
  retrospective: {
    sprint: "Sprint 1",
    wentWell: [{ item: "Kafka reuse saved a week" }, { item: "Daily QA pairing caught issues early" }],
    didnt: [{ item: "Redis region misconfig blocked NOTIF-6" }, { item: "Email copy arrived late" }],
    actions: [
      { action: "Add infra readiness check to sprint planning", owner: "PM" },
      { action: "Lock content deadlines in the SOW", owner: "Sarah" },
    ],
  },
  "stakeholder-update": {
    audience: "Sarah Chen (Sponsor)",
    headline: "Notification engine on track for email MVP; one infra blocker being resolved.",
    progress: [
      { item: "Kafka consumer and dedup complete (NOTIF-2)" },
      { item: "Email templates approved (NOTIF-5)" },
    ],
    risks: [{ risk: "NOTIF-6 blocked on Redis region - infra ETA pending" }],
    asks: [{ ask: "Confirm webhook scope for Sprint 2 by Friday" }],
  },
  roadmap: {
    goal: "Ship real-time notifications before the Salesforce conference",
    horizon: "Next 8 weeks",
    weeks: "8",
    tasks: [
      { name: "Discovery + charter", lane: "Sprint 0", startWeek: "1", endWeek: "1", startDate: "2026-06-01", endDate: "2026-06-05" },
      { name: "Notification engine (email)", lane: "Sprint 1", startWeek: "2", endWeek: "3", startDate: "2026-06-09", endDate: "2026-06-20" },
      { name: "Recipient management", lane: "Sprint 1", startWeek: "3", endWeek: "4", startDate: "2026-06-16", endDate: "2026-06-27" },
      { name: "Webhook delivery", lane: "Sprint 2", startWeek: "5", endWeek: "6", startDate: "2026-06-30", endDate: "2026-07-11" },
      { name: "Hardening + release", lane: "Sprint 2", startWeek: "7", endWeek: "8", startDate: "2026-07-14", endDate: "2026-07-25" },
    ],
  },
  "budget-tracker": {
    project: "Finwave Notifications",
    budget: "80000",
    developers: [
      { name: "Marcus (BE)", hours: "160", rate: "120" },
      { name: "Aiko (BE)", hours: "150", rate: "110" },
      { name: "Lin (FE)", hours: "80", rate: "100" },
      { name: "Priya (QA)", hours: "120", rate: "90" },
    ],
  },
};
