import { useState } from "react";
import {
  CartesianGrid, Cell, ReferenceArea, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  type RiskScanPayload, type Priority, type HML, type StatusTone, type RagStatus,
  PRIORITY_TONE,
} from "@/types/pm";
import { cn } from "@/lib/utils";
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
  const [pri, setPri] = useState<Priority | null>(null);
  const register = pri ? payload.register.filter((r) => r.priority === pri) : payload.register;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Analysis - {payload.project}</p>
          <p className="text-sm text-muted-foreground">Phase: {payload.phase} - Depth: {payload.depth}</p>
        </div>
        <StatusBadge tone={RAG_TONE[payload.verdict]}>{payload.verdict.toUpperCase()} RISK</StatusBadge>
      </div>

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
              <th className="px-3 py-2">Likelihood</th>
              <th className="px-3 py-2">Impact</th>
              <th className="px-3 py-2">Detect</th>
              <th className="px-3 py-2">Velocity</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {register.map((r) => (
              <tr key={r.ref} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{r.ref}</td>
                <td className="px-3 py-2">{r.risk}</td>
                <td className="px-3 py-2"><StatusBadge tone={HML_TONE[r.likelihood]}>{r.likelihood}</StatusBadge></td>
                <td className="px-3 py-2"><StatusBadge tone={HML_TONE[r.impact]}>{r.impact}</StatusBadge></td>
                <td className="px-3 py-2 text-muted-foreground">{r.detectability}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.velocity}</td>
                <td className="px-3 py-2"><StatusBadge tone={PRIORITY_TONE[r.priority]}>{PRIORITY_LABEL[r.priority]}</StatusBadge></td>
                <td className="px-3 py-2 text-muted-foreground">{r.owner}</td>
              </tr>
            ))}
            {register.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No risks at this priority.</td></tr>
            )}
          </tbody>
        </table>
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
