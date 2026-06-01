import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { type BudgetTrackerPayload, type RagStatus, type StatusTone } from "@/types/pm";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Panel } from "./Panel";

const RAG_TONE: Record<RagStatus, StatusTone> = { red: "danger", amber: "warning", green: "success" };
const RAG_LABEL: Record<RagStatus, string> = { red: "Over / at risk", amber: "Watch", green: "On budget" };
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** /budget-tracker : per-developer cost mapped against the approved budget. */
export function BudgetTrackerView({ payload }: { payload: BudgetTrackerPayload }) {
  const devs = payload.developers ?? [];
  const over = payload.spent > payload.approved;
  const pct = payload.approved > 0 ? Math.min(100, (payload.spent / payload.approved) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Budget - {payload.project}</p>
          <p className="text-sm text-muted-foreground">{devs.length} contributor{devs.length === 1 ? "" : "s"}</p>
        </div>
        <StatusBadge tone={RAG_TONE[payload.verdict]}>{RAG_LABEL[payload.verdict]}</StatusBadge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Approved" value={money(payload.approved)} />
        <Metric label="Spent" value={money(payload.spent)} />
        <Metric
          label={over ? "Over by" : "Remaining"}
          value={money(Math.abs(payload.remaining))}
          tone={over ? "danger" : "success"}
        />
      </div>

      {/* Spent vs approved bar */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-card">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Spent {money(payload.spent)}</span>
          <span>Budget {money(payload.approved)}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", over ? "bg-status-danger" : "bg-status-info")} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Per-developer breakdown */}
      {devs.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Developer</th>
                <th className="px-3 py-2 text-right">Hours</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {devs.map((d, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{d.hours}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{money(d.rate)}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{money(d.cost)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40">
                <td className="px-3 py-2 font-semibold">Total</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{devs.reduce((s, d) => s + d.hours, 0)}</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{money(payload.spent)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {payload.burn && payload.burn.length > 0 && (
        <Panel title="Burn rate (cumulative vs budget)">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={payload.burn} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Area type="monotone" dataKey="cumulative" name="Spent" stroke="hsl(var(--status-info))" fill="hsl(var(--status-info) / 0.18)" strokeWidth={2} />
              <Line type="monotone" dataKey="budgetLine" name="Budget" stroke="hsl(var(--status-danger))" strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      {tone ? (
        <StatusBadge tone={tone} className="mt-1">{value}</StatusBadge>
      ) : (
        <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
      )}
    </div>
  );
}
