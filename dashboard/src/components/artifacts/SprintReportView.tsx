import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { type SprintReportPayload, type RagStatus, type StatusTone } from "@/types/pm";
import { StatusBadge } from "./StatusBadge";
import { Panel } from "./Panel";

const RAG_TONE: Record<RagStatus, StatusTone> = { red: "danger", amber: "warning", green: "success" };
const RAG_LABEL: Record<RagStatus, string> = { red: "Red", amber: "Amber", green: "Green" };

/** /sprint-report : velocity (bar) + burndown (line) + headline metrics. */
export function SprintReportView({ payload }: { payload: SprintReportPayload }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{payload.sprint}</p>
          <p className="text-sm text-muted-foreground">Day {payload.day} of {payload.totalDays}</p>
        </div>
        <StatusBadge tone={RAG_TONE[payload.status]}>{RAG_LABEL[payload.status]}</StatusBadge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Confidence" value={`${payload.confidence}%`} />
        <Metric label="Completed" value={`${payload.completed}/${payload.committed} pts`} />
        <Metric label="Forecast" value={payload.forecast} />
      </div>

      <Panel title="Velocity (recent sprints)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={payload.velocityTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="sprint" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="points" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Burndown">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={payload.burndown} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="ideal" name="Ideal" stroke="hsl(var(--status-na))" strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="remaining" name="Remaining" stroke="hsl(var(--status-info))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      {payload.topRisks.length > 0 && (
        <Panel title="Top risks">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {payload.topRisks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
