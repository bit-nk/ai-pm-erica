import { useEffect, useState } from "react";
import {
  CartesianGrid, Cell, ReferenceArea, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import {
  type RiskScanPayload, type RiskEntry, type Priority, type HML, type StatusTone, type RagStatus,
  PRIORITY_TONE,
} from "@/types/pm";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/workspace";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

const PRIORITY_FILL: Record<Priority, string> = {
  "act-now": "hsl(var(--status-danger))",
  monitor: "hsl(var(--status-warning))",
  contingency: "hsl(var(--status-warning))",
  log: "hsl(var(--status-success))",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  "act-now": "Act now", monitor: "Monitor", contingency: "Contingency", log: "Log",
};
const PRIORITIES: Priority[] = ["act-now", "monitor", "contingency", "log"];
const HML_TONE: Record<HML, StatusTone> = { H: "danger", M: "warning", L: "neutral" };
const RAG_TONE: Record<RagStatus, StatusTone> = { red: "danger", amber: "warning", green: "success" };

/** /risk-scan : matrix + scored register, filterable by priority (click a chip). */
export function RiskScanView({ payload }: { payload: RiskScanPayload }) {
  const ws = useWorkspace();
  // Was the visualisation generated during orchestration (or for a pre-built project)?
  const vizApproved = !!(ws.activeProjectId && ws.riskVizApproved[ws.activeProjectId]);
  const [pri, setPri] = useState<Priority | null>(null);
  const [showDash, setShowDash] = useState(vizApproved);
  useEffect(() => { if (vizApproved) setShowDash(true); }, [vizApproved]);
  const register = pri ? payload.register.filter((r) => r.priority === pri) : payload.register;

  const generate = () => {
    setShowDash(true);
    if (ws.activeProjectId) ws.setRiskViz(ws.activeProjectId, true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Analysis - {payload.project}</p>
          <p className="text-sm text-muted-foreground">Phase: {payload.phase} - Depth: {payload.depth}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {vizApproved ? (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowDash((v) => !v)}>
              <Sparkles className="h-3.5 w-3.5" /> {showDash ? "Hide dashboard" : "Show dashboard"}
            </Button>
          ) : (
            // Visuals were skipped at orchestration: offer on-demand generation.
            <Button size="sm" variant="outline" className="gap-1.5" onClick={generate}>
              <Sparkles className="h-3.5 w-3.5" /> Generate dashboard
            </Button>
          )}
          <StatusBadge tone={RAG_TONE[payload.verdict]}>{payload.verdict.toUpperCase()} RISK</StatusBadge>
        </div>
      </div>

      {showDash && <ExecutiveDashboard register={payload.register} />}

      <div className="rounded-xl border border-border bg-card p-3 shadow-card">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Likelihood x Impact</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="hsl(var(--heat-low))" fillOpacity={0.55} />
            <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="hsl(var(--heat-mid))" fillOpacity={0.5} />
            <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="hsl(var(--heat-mid))" fillOpacity={0.5} />
            <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="hsl(var(--heat-high))" fillOpacity={0.55} />
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number" dataKey="x" domain={[0, 100]} tickCount={6} tick={{ fontSize: 11 }}
              label={{ value: "Likelihood", position: "insideBottom", offset: -12, fontSize: 11 }}
            />
            <YAxis
              type="number" dataKey="y" domain={[0, 100]} tickCount={6} tick={{ fontSize: 11 }}
              label={{ value: "Impact", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<MatrixTooltip />} />
            <Scatter data={payload.matrix} isAnimationActive={false}>
              {payload.matrix.map((p) => (
                <Cell key={p.ref} fill={PRIORITY_FILL[p.priority]} fillOpacity={pri && p.priority !== pri ? 0.15 : 1} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Clickable priority legend - filters the register + dims the matrix */}
      <div className="flex flex-wrap items-center gap-2">
        {PRIORITIES.map((k) => {
          const active = pri === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={active}
              onClick={() => setPri(active ? null : k)}
              className="rounded-full transition-transform hover:-translate-y-0.5"
            >
              <StatusBadge tone={PRIORITY_TONE[k]} className={cn(active && "ring-2 ring-foreground/40", !active && "opacity-80")}>
                {PRIORITY_LABEL[k]}
              </StatusBadge>
            </button>
          );
        })}
        {pri && (
          <button type="button" onClick={() => setPri(null)} className="text-xs text-muted-foreground underline underline-offset-2">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Ref</th>
              <th className="px-3 py-2">Risk</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Likelihood</th>
              <th className="px-3 py-2">Impact</th>
              <th className="px-3 py-2">Detect</th>
              <th className="px-3 py-2">Velocity</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Response</th>
              <th className="px-3 py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {register.map((r) => (
              <tr key={r.ref} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{r.ref}</td>
                <td className="px-3 py-2">{r.risk}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.category}</td>
                <td className="px-3 py-2"><StatusBadge tone={HML_TONE[r.likelihood]}>{r.likelihood}</StatusBadge></td>
                <td className="px-3 py-2"><StatusBadge tone={HML_TONE[r.impact]}>{r.impact}</StatusBadge></td>
                <td className="px-3 py-2 text-muted-foreground">{r.detectability}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.velocity}</td>
                <td className="px-3 py-2"><StatusBadge tone={PRIORITY_TONE[r.priority]}>{PRIORITY_LABEL[r.priority]}</StatusBadge></td>
                <td className="px-3 py-2 text-muted-foreground">{r.response}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.owner}</td>
              </tr>
            ))}
            {register.length === 0 && (
              <tr><td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">No risks at this priority.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── visualisation skill: executive dashboard from the risk register ── */

const RAG_OF: Record<Priority, RagStatus> = { "act-now": "red", monitor: "amber", contingency: "amber", log: "green" };

function countBy(arr: RiskEntry[], key: (r: RiskEntry) => string): [string, number][] {
  const m = new Map<string, number>();
  for (const r of arr) { const k = (key(r) || "-").trim() || "-"; m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** The `visualisation` skill rendered: summary cards + category/owner/urgency. */
function ExecutiveDashboard({ register }: { register: RiskEntry[] }) {
  const total = register.length;
  const reds = register.filter((r) => RAG_OF[r.priority] === "red").length;
  const ambers = register.filter((r) => RAG_OF[r.priority] === "amber").length;
  const greens = register.filter((r) => RAG_OF[r.priority] === "green").length;
  const byCat = countBy(register, (r) => r.category);
  const byOwner = countBy(register, (r) => r.owner);
  const PROX_ORDER = ["Week 1-2", "Month 1", "Month 2-3", "Later"];
  const timeline = PROX_ORDER.map((p) => [p, register.filter((r) => (r.proximity ?? "Later") === p).length] as [string, number]);
  const topCat = byCat[0]?.[0] ?? "-";

  return (
    <div className="space-y-3 rounded-xl border border-accent/40 bg-muted/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Executive dashboard</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="Total" value={total} />
        <Stat label="Red" value={reds} tone="danger" />
        <Stat label="Amber" value={ambers} tone="warning" />
        <Stat label="Green" value={greens} tone="success" />
        <Stat label="Top category" value={topCat} />
      </div>

      <Distribution title="Risk timeline (by proximity)" data={timeline} total={total} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Distribution title="Category distribution" data={byCat} total={total} />
        <Distribution title="Ownership distribution" data={byOwner} total={total} />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: StatusTone }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      {tone ? (
        <StatusBadge tone={tone} className="mt-1 text-sm">{value}</StatusBadge>
      ) : (
        <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
      )}
    </div>
  );
}

function Distribution({ title, data, total }: { title: string; data: [string, number][]; total: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-xs font-medium">{title}</p>
      <div className="space-y-1.5">
        {data.map(([label, n]) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 truncate text-muted-foreground" title={label}>{label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-status-info" style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
            </div>
            <span className="w-4 shrink-0 text-right tabular-nums">{n}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-muted-foreground">No data.</p>}
      </div>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: { ref: string; x: number; y: number } }[];
}
function MatrixTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-pop">
      <p className="font-mono font-semibold">{p.ref}</p>
      <p className="text-muted-foreground">Likelihood {p.x} - Impact {p.y}</p>
    </div>
  );
}
