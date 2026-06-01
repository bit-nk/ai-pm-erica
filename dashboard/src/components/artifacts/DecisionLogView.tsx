import { useState } from "react";
import {
  type DecisionLogPayload, type DecisionLogEntry, type ChangeStatus, type StatusTone,
} from "@/types/pm";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

const STATUS_TONE: Record<ChangeStatus, StatusTone> = {
  Proposed: "info",
  "Under Review": "warning",
  Approved: "success",
  Rejected: "danger",
};
const STATUSES: ChangeStatus[] = ["Proposed", "Under Review", "Approved", "Rejected"];

/** The 11 mandatory columns, in order. */
const COLUMNS: { key: keyof DecisionLogEntry; header: string }[] = [
  { key: "area", header: "Area" },
  { key: "originalPlan", header: "Original Plan" },
  { key: "revisedPlan", header: "Revised Plan" },
  { key: "reason", header: "Reason" },
  { key: "changeProposedBy", header: "Change Owner" },
  { key: "deliveryImpact", header: "Delivery Impact" },
  { key: "technicalImpact", header: "Technical Impact" },
  { key: "productOwnerImpact", header: "Product Owner Impact" },
  { key: "costImpact", header: "Cost Impact" },
  { key: "changeStatus", header: "Change Status" },
  { key: "changeApprovedBy", header: "Approver" },
];

/** /decision-log : 11-column data grid, filterable by change status. */
export function DecisionLogView({ payload }: { payload: DecisionLogPayload }) {
  const [filter, setFilter] = useState<ChangeStatus | null>(null);
  const entries = filter ? payload.entries.filter((e) => e.changeStatus === filter) : payload.entries;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Decision Log - {payload.project}</p>
        {payload.preparedBy && <p className="text-sm text-muted-foreground">Prepared by {payload.preparedBy}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => {
          const active = filter === s;
          const count = payload.entries.filter((e) => e.changeStatus === s).length;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(active ? null : s)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                active ? "border-foreground bg-muted ring-1 ring-foreground/20" : "border-border bg-card hover:bg-muted",
              )}
            >
              <StatusBadge tone={STATUS_TONE[s]}>{count}</StatusBadge>
              <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>{s}</span>
            </button>
          );
        })}
        {filter && (
          <button type="button" onClick={() => setFilter(null)} className="text-xs text-muted-foreground underline underline-offset-2">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {COLUMNS.map((c) => <th key={c.key} className="px-3 py-2 font-medium">{c.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} className="border-b border-border/60 align-top last:border-0">
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-3 py-2">
                    {c.key === "changeStatus" ? (
                      <StatusBadge tone={STATUS_TONE[entry.changeStatus]}>{entry.changeStatus}</StatusBadge>
                    ) : (
                      <span className={c.key === "area" ? "font-medium" : "text-muted-foreground"}>{entry[c.key]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={COLUMNS.length} className="px-3 py-6 text-center text-muted-foreground">No {filter} decisions.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
