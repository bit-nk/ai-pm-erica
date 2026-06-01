import type {
  SkillExecution, SkillId, RagStatus, Priority, HML,
  RiskScanPayload, RiskEntry, RiskMatrixPoint,
  StoriesPayload,
  ReleaseChecklistPayload, ReleaseCategory, ReleaseCategoryId, ChecklistItem, ChecklistStatus, ChecklistTally, ReleaseVerdict,
  SprintPlanPayload, BacklogItem, BacklogPriority, CapacityRow,
  RoadmapPayload, RoadmapTask,
  BudgetTrackerPayload, BudgetDeveloper,
  DecisionLogPayload, DecisionLogEntry, ChangeStatus,
  SprintReportPayload,
} from "@/types/pm";
import type { EpicGroup, OnbStep, Row, StepValues } from "./steps";

const rows = (values: StepValues, name: string): Row[] => (Array.isArray(values[name]) ? (values[name] as Row[]) : []);
const str = (values: StepValues, name: string): string => (typeof values[name] === "string" ? (values[name] as string) : "");
const tags = (values: StepValues, name: string): string[] => (Array.isArray(values[name]) ? (values[name] as string[]) : []);
const epicGroups = (values: StepValues, name: string): EpicGroup[] => (Array.isArray(values[name]) ? (values[name] as EpicGroup[]) : []);

const COORD: Record<string, number> = { H: 80, M: 50, L: 20 };
const PRIORITY_FROM_LABEL: Record<string, Priority> = {
  "Act now": "act-now", Monitor: "monitor", Contingency: "contingency", Log: "log",
};

function derivePriority(l: string, i: string): Priority {
  if (l === "H" && i === "H") return "act-now";
  if (i === "H") return "contingency";
  if (l === "H") return "monitor";
  return "log";
}

function buildRiskScan(values: StepValues): RiskScanPayload {
  const register: RiskEntry[] = rows(values, "risks")
    .filter((r) => r.risk?.trim())
    .map((r, idx) => {
      const likelihood = (r.likelihood || "M") as HML;
      const impact = (r.impact || "M") as HML;
      const priority = PRIORITY_FROM_LABEL[r.priority] ?? derivePriority(likelihood, impact);
      return {
        ref: `R${idx + 1}`, risk: r.risk, category: "Delivery",
        likelihood, impact, detectability: "Moderate", velocity: "Medium",
        priority, owner: r.owner?.trim() || "Unassigned", response: "Mitigate",
      };
    });
  const matrix: RiskMatrixPoint[] = register.map((e) => ({
    ref: e.ref, x: COORD[e.likelihood] ?? 50, y: COORD[e.impact] ?? 50, priority: e.priority,
  }));
  const verdict: RagStatus = register.some((e) => e.priority === "act-now")
    ? "red" : register.some((e) => e.priority !== "log") ? "amber" : "green";
  return { skill: "risk-scan", project: "This project", phase: "pre-project", depth: "medium", verdict, register, matrix };
}

function buildStories(values: StepValues): StoriesPayload {
  const epics = epicGroups(values, "epics")
    .filter((g) => g.name?.trim() || (g.stories ?? []).length)
    .map((g) => ({
      name: g.name || "Epic", summary: "",
      stories: (g.stories ?? [])
        .filter((s) => s.title?.trim())
        .map((s) => ({ title: s.title, points: s.points ? Number(s.points) : undefined, status: s.status || undefined })),
    }));
  return { skill: "stories", epics };
}

const CAT_ID: Record<string, ReleaseCategoryId> = {
  "Feature Readiness": "feature-readiness", "Testing": "testing", "Operational Readiness": "operational-readiness",
  "Communications": "communications", "Dependencies": "dependencies", "Approvals": "approvals", "Post-Release Readiness": "post-release-readiness",
};

function buildRelease(values: StepValues): ReleaseChecklistPayload {
  const tally: ChecklistTally = { PASS: 0, FAIL: 0, RISK: 0, UNCONFIRMED: 0, "N/A": 0 };
  const byCat = new Map<string, ChecklistItem[]>();
  const blockers: { ref: string; label: string; owner: string }[] = [];
  rows(values, "items").filter((r) => r.item?.trim()).forEach((r, idx) => {
    const status = (r.status || "UNCONFIRMED") as ChecklistStatus;
    tally[status]++;
    const cat = r.category || "Feature Readiness";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push({ ref: `I${idx + 1}`, label: r.item, status });
    if (status === "FAIL" || status === "UNCONFIRMED") blockers.push({ ref: `I${idx + 1}`, label: r.item, owner: "PM" });
  });
  const categories: ReleaseCategory[] = [...byCat.entries()].map(([title, items]) => ({
    id: CAT_ID[title] ?? "feature-readiness", title, items,
  }));
  const verdict: ReleaseVerdict = tally.FAIL > 0 ? "NO-GO" : (tally.RISK > 0 || tally.UNCONFIRMED > 0) ? "CONDITIONAL GO" : "GO";
  return {
    skill: "release-checklist", release: "This release", releaseType: "planned", categories, tally, blockers, verdict,
    verdictRationale: verdict === "GO" ? "All checks passed."
      : verdict === "NO-GO" ? "Resolve the failing items before shipping."
      : "Clear the open risks / unconfirmed items first.",
  };
}

function buildSprintPlan(values: StepValues): SprintPlanPayload {
  const capacity: CapacityRow[] = rows(values, "team")
    .filter((t) => t.person?.trim())
    .map((t) => ({ person: t.person, availableDays: 0, workingDays: 0, usableCapacity: Number(t.points) || 0 }));
  const usableCapacity = capacity.reduce((s, c) => s + c.usableCapacity, 0);
  const backlog: BacklogItem[] = rows(values, "backlog")
    .filter((r) => r.item?.trim())
    .map((r) => ({
      priority: (r.priority || "P1") as BacklogPriority, item: r.item,
      estimate: Number(r.points) || 0, owner: "Team", isStretch: r.priority === "P2",
    }));
  const plannedLoad = backlog.filter((b) => b.priority !== "P2").reduce((s, b) => s + b.estimate, 0);
  const loadRatio = usableCapacity > 0 ? plannedLoad / usableCapacity : 0;
  return {
    skill: "sprint-planning", sprint: { number: 1, goal: "Sprint 1" },
    capacity, usableCapacity, backlog, plannedLoad, loadRatio,
    capacityThreshold: { min: 0.7, max: 0.8 }, overcommitted: loadRatio > 0.8,
  };
}

function buildRoadmap(values: StepValues): RoadmapPayload {
  const weeks = Number(str(values, "weeks")) || 8;
  const tasks: RoadmapTask[] = rows(values, "tasks")
    .filter((t) => t.name?.trim())
    .map((t) => {
      const s = Math.min(weeks, Math.max(1, Number(t.startWeek) || 1));
      const e = Math.min(weeks, Math.max(s, Number(t.endWeek) || s));
      return {
        name: t.name, lane: t.lane?.trim() || "Lane", startWeek: s, endWeek: e,
        startDate: t.startDate?.trim() || undefined, endDate: t.endDate?.trim() || undefined,
      };
    });
  const lanes = [...new Set(tasks.map((t) => t.lane))];
  return { skill: "roadmap", goal: str(values, "goal") || "Roadmap", horizon: str(values, "horizon"), weeks, lanes, tasks };
}

function buildBudget(values: StepValues): BudgetTrackerPayload {
  const approved = Number(str(values, "budget")) || 0;
  const developers: BudgetDeveloper[] = rows(values, "developers")
    .filter((d) => d.name?.trim())
    .map((d) => {
      const hours = Number(d.hours) || 0;
      const rate = Number(d.rate) || 0;
      return { name: d.name, hours, rate, cost: hours * rate };
    });
  const spent = developers.reduce((s, d) => s + d.cost, 0);
  const remaining = approved - spent;
  const verdict: RagStatus = spent > approved ? "red" : spent > approved * 0.85 ? "amber" : "green";
  return {
    skill: "budget-tracker", project: str(values, "project") || "This project", verdict,
    approved, spent, committed: 0, remaining, forecastAtCompletion: spent, variance: remaining,
    timeElapsedPct: 0, scopeCompletePct: 0, developers,
  };
}

function buildDecisionLog(values: StepValues): DecisionLogPayload {
  const entries: DecisionLogEntry[] = rows(values, "entries")
    .filter((r) => (r.originalPlan?.trim() || r.revisedPlan?.trim()))
    .map((r) => ({
      area: (r.area || "Scope") as DecisionLogEntry["area"],
      originalPlan: r.originalPlan || "-",
      revisedPlan: r.revisedPlan || "-",
      reason: r.reason || "-",
      changeProposedBy: "-",
      deliveryImpact: "-",
      technicalImpact: "-",
      productOwnerImpact: "-",
      costImpact: "-",
      changeStatus: (r.changeStatus || "Proposed") as ChangeStatus,
      changeApprovedBy: r.changeApprovedBy?.trim() || "[TBC]",
    }));
  return { skill: "decision-log", project: str(values, "project") || "This project", entries };
}

function buildSprintReport(values: StepValues): SprintReportPayload {
  const committed = Number(str(values, "committed")) || 0;
  const completed = Number(str(values, "completed")) || 0;
  const totalDays = Number(str(values, "totalDays")) || 10;
  const day = Math.min(totalDays, Number(str(values, "day")) || 0);
  const status = (str(values, "status") || "amber") as RagStatus;
  const confidence = Number(str(values, "confidence")) || 0;
  const topRisks = rows(values, "topRisks").map((r) => r.risk).filter(Boolean) as string[];
  const remaining = Math.max(0, committed - completed);
  const burndown = [
    { day: 0, remaining: committed, ideal: committed },
    { day, remaining, ideal: Math.round(committed * (1 - day / Math.max(1, totalDays))) },
  ];
  const velocityTrend = [{ sprint: "Prev", points: 0 }, { sprint: "Now", points: completed }];
  return {
    skill: "sprint-report", sprint: str(values, "sprint") || "Sprint", day, totalDays, status, confidence,
    forecast: str(values, "forecast"), committed, completed, velocityTrend, burndown, topRisks,
  };
}

/** Markdown fallback for steps without a bespoke visual view. */
function buildMarkdown(step: OnbStep, values: StepValues): string {
  let md = `## ${step.title}\n\n`;
  for (const f of step.fields) {
    if (f.kind === "epics") {
      md += `**${f.label}**\n\n`;
      for (const e of epicGroups(values, f.name)) {
        md += `### ${e.name || "Epic"}\n`;
        for (const s of e.stories ?? []) if (s.title?.trim()) md += `- ${s.title}${s.points ? ` (${s.points})` : ""}${s.status ? ` [${s.status}]` : ""}\n`;
        md += "\n";
      }
    } else if (f.kind === "tags") {
      md += `**${f.label}:** ${tags(values, f.name).join(", ") || "-"}\n\n`;
    } else if (f.kind === "list") {
      md += `**${f.label}**\n\n`;
      for (const row of rows(values, f.name)) {
        const cells = f.itemFields.map((itf) => row[itf.name]).filter(Boolean);
        if (cells.length) md += `- ${cells.join(" - ")}\n`;
      }
      md += "\n";
    } else {
      md += `**${f.label}:** ${str(values, f.name) || "-"}\n\n`;
    }
  }
  return md;
}

/** True when every field is blank - the section is empty / skipped. */
function valuesEmpty(step: OnbStep, values: StepValues): boolean {
  return step.fields.every((f) => {
    const v = values[f.name];
    if (f.kind === "list") return !(Array.isArray(v) && (v as Row[]).some((r) => Object.values(r).some((x) => String(x ?? "").trim())));
    if (f.kind === "epics") return !(Array.isArray(v) && (v as EpicGroup[]).some((e) => (e.name ?? "").trim() || (e.stories ?? []).some((s) => Object.values(s).some((x) => String(x ?? "").trim()))));
    if (f.kind === "tags") return !(Array.isArray(v) && (v as string[]).length > 0);
    return !String(v ?? "").trim();
  });
}

/** Build a live artifact for a step from its current structured values. */
export function buildExecution(step: OnbStep, values: StepValues, clientId: string, projectId: string): SkillExecution {
  const request = { skill: step.id as SkillId, clientId, projectId, input: "" };
  // Empty section -> no markdown, no payload, so the canvas shows a clean
  // empty state instead of bare headers and zeroed charts.
  if (valuesEmpty(step, values)) {
    return { id: `onb-${step.id}`, request, status: "complete", markdown: "" };
  }
  const wrap = (payload?: SkillExecution["payload"]): SkillExecution => ({
    id: `onb-${step.id}`,
    request,
    status: "complete",
    markdown: buildMarkdown(step, values),
    payload,
  });
  switch (step.id) {
    case "risk-scan": return wrap(buildRiskScan(values));
    case "stories": return wrap(buildStories(values));
    case "release-checklist": return wrap(buildRelease(values));
    case "sprint-planning": return wrap(buildSprintPlan(values));
    case "roadmap": return wrap(buildRoadmap(values));
    case "budget-tracker": return wrap(buildBudget(values));
    case "decision-log": return wrap(buildDecisionLog(values));
    case "sprint-report": return wrap(buildSprintReport(values));
    default: return wrap(undefined);
  }
}
