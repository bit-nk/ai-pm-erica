import { type StoriesPayload } from "@/types/pm";
import { StatusBadge } from "./StatusBadge";
import { Panel } from "./Panel";

/** /stories : epics with nested user stories (As a / I want / So that + AC). */
export function StoriesView({ payload }: { payload: StoriesPayload }) {
  return (
    <div className="space-y-3">
      {payload.epics.map((epic) => (
        <Panel key={epic.name} title={`${epic.key ? `${epic.key} ` : ""}${epic.name}`}>
          {epic.summary && <p className="mb-2 text-sm text-muted-foreground">{epic.summary}</p>}
          <ul className="space-y-2">
            {epic.stories.map((s, i) => {
              const story = s.asA || s.iWant || s.soThat
                ? `As a ${s.asA ?? "user"}, I want to ${s.iWant ?? s.title}${s.soThat ? `, so that ${s.soThat}` : ""}`
                : null;
              return (
                <li key={i} className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 font-medium">
                      {s.key && <span className="mr-2 font-mono text-xs text-muted-foreground">{s.key}</span>}
                      {s.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {s.points != null && <span className="text-xs text-muted-foreground">{s.points} pts</span>}
                      {s.status && <StatusBadge tone="neutral">{s.status}</StatusBadge>}
                    </span>
                  </div>
                  {story && <p className="mt-0.5 text-xs italic text-muted-foreground">{story}</p>}
                  {s.acceptanceCriteria && s.acceptanceCriteria.length > 0 && (
                    <div className="mt-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Acceptance criteria</p>
                      <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs">
                        {s.acceptanceCriteria.map((c, j) => <li key={j}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
