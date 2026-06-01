import { type ReactNode } from "react";
import { type SprintPlanPayload, type BacklogPriority, type StatusTone } from "@/types/pm";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

const PRIO_TONE: Record<BacklogPriority, StatusTone> = { P0: "danger", P1: "warning", P2: "neutral" };

/** /sprint-planning : capacity, 70-80% target band, overcommit flag, backlog. */
export function SprintPlanView({ payload }: { payload: SprintPlanPayload }) {
  const pct = Math.round(payload.loadRatio * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Sprint {payload.sprint.number}</p>
          <p className="text-sm text-muted-foreground">{payload.sprint.goal}</p>
        </div>
        <p className="text-xs text-muted-foreground">{payload.sprint.startDate} - {payload.sprint.endDate}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">Committed load</span>
          <span className="tabular-nums">{payload.plannedLoad} / {payload.usableCapacity} pts ({pct}%)</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          {/* 70-80% target band */}
          <div className="absolute inset-y-0" style={{ left: "70%", width: "10%", background: "hsl(var(--status-success) / 0.3)" }} />
          <div
            className={cn("h-full rounded-full transition-[width]", payload.overcommitted ? "bg-status-danger" : "bg-status-success")}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Target band 70-80% of usable capacity.</p>
        {payload.overcommitted && (
          <div className="mt-3 rounded-lg border border-status-danger/30 bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
            Over-committed at {pct}%. Recommend cutting a P1 or moving it to P2 stretch.
          </div>
        )}
      </div>

      <Table caption="Capacity" head={["Person", "Days", "Usable", "Notes"]}>
        {payload.capacity.map((c) => (
          <tr key={c.person} className="border-b border-border/60 last:border-0">
            <td className="px-3 py-2 font-medium">{c.person}</td>
            <td className="px-3 py-2 text-muted-foreground">{c.availableDays}/{c.workingDays}</td>
            <td className="px-3 py-2 tabular-nums">{c.usableCapacity} pts</td>
            <td className="px-3 py-2 text-muted-foreground">{c.notes ?? "-"}</td>
          </tr>
        ))}
      </Table>

      <Table caption="Backlog" head={["Priority", "Item", "Est", "Owner", "Dependencies"]}>
        {payload.backlog.map((b, i) => (
          <tr key={i} className="border-b border-border/60 last:border-0">
            <td className="px-3 py-2">
              <StatusBadge tone={PRIO_TONE[b.priority]}>{b.priority}</StatusBadge>
              {b.isStretch && <span className="ml-1.5 text-xs text-muted-foreground">stretch</span>}
            </td>
            <td className="px-3 py-2">{b.item}</td>
            <td className="px-3 py-2 tabular-nums">{b.estimate}</td>
            <td className="px-3 py-2 text-muted-foreground">{b.owner}</td>
            <td className="px-3 py-2 text-muted-foreground">{b.dependencies ?? "-"}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function Table({ caption, head, children }: { caption: string; head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <p className="border-b border-border px-3 py-2 text-sm font-semibold">{caption}</p>
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
