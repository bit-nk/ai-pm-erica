import { useState } from "react";
import {
  type ReleaseChecklistPayload, type ReleaseVerdict, type ChecklistStatus, CHECKLIST_TONE,
} from "@/types/pm";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

const VERDICT_BANNER: Record<ReleaseVerdict, string> = {
  GO: "bg-status-success-bg text-status-success border-status-success/30",
  "NO-GO": "bg-status-danger-bg text-status-danger border-status-danger/30",
  "CONDITIONAL GO": "bg-status-warning-bg text-status-warning border-status-warning/30",
};

const TALLY_KEYS: ChecklistStatus[] = ["PASS", "RISK", "FAIL", "UNCONFIRMED", "N/A"];

/** /release-checklist : verdict banner, multi-select tally filter, 7 categories. */
export function ReleaseChecklistView({ payload }: { payload: ReleaseChecklistPayload }) {
  const [filters, setFilters] = useState<ChecklistStatus[]>([]);
  const toggle = (k: ChecklistStatus) =>
    setFilters((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
  const hasFilters = filters.length > 0;

  const categories = payload.categories
    .map((cat) => ({ ...cat, items: hasFilters ? cat.items.filter((i) => filters.includes(i.status)) : cat.items }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="space-y-4">
      <div className={cn("rounded-xl border p-4 text-center", VERDICT_BANNER[payload.verdict])}>
        <p className="text-[11px] uppercase tracking-widest opacity-70">Verdict</p>
        <p className="text-2xl font-bold">{payload.verdict}</p>
        <p className="mt-1 text-sm opacity-80">{payload.verdictRationale}</p>
      </div>

      {/* Clickable tally - select multiple to filter the checklist below */}
      <div className="flex flex-wrap items-center gap-2">
        {TALLY_KEYS.map((k) => {
          const active = filters.includes(k);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(k)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                active ? "border-foreground bg-muted ring-1 ring-foreground/20" : "border-border bg-card hover:bg-muted",
              )}
            >
              <StatusBadge tone={CHECKLIST_TONE[k]}>{payload.tally[k]}</StatusBadge>
              <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>{k}</span>
            </button>
          );
        })}
        {hasFilters && (
          <button type="button" onClick={() => setFilters([])} className="text-xs text-muted-foreground underline underline-offset-2">
            Clear
          </button>
        )}
      </div>

      {payload.blockers.length > 0 && !hasFilters && (
        <div className="rounded-xl border border-status-danger/30 bg-status-danger-bg p-3">
          <p className="mb-1 text-sm font-semibold text-status-danger">Blockers</p>
          <ul className="space-y-1 text-sm">
            {payload.blockers.map((b) => (
              <li key={b.ref}>
                <span className="font-mono text-xs">{b.ref}</span> {b.label}{" "}
                <span className="text-muted-foreground">- {b.owner}{b.due ? `, by ${b.due}` : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
          No items match {filters.join(", ")}.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              <p className="border-b border-border px-3 py-2 text-sm font-semibold">{cat.title}</p>
              <ul>
                {cat.items.map((item) => (
                  <li key={item.ref} className="flex items-start gap-3 border-b border-border/50 px-3 py-2 last:border-0">
                    <span className="mt-0.5 font-mono text-xs text-muted-foreground">{item.ref}</span>
                    <span className="flex-1 text-sm">
                      {item.label}
                      {item.note && <span className="block text-xs text-muted-foreground">{item.note}</span>}
                    </span>
                    <StatusBadge tone={CHECKLIST_TONE[item.status]}>{item.status}</StatusBadge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
