import { type StoriesPayload } from "@/types/pm";
import { StatusBadge } from "./StatusBadge";
import { Panel } from "./Panel";

/** /stories : epics with their nested user stories. */
export function StoriesView({ payload }: { payload: StoriesPayload }) {
  return (
    <div className="space-y-3">
      {payload.epics.map((epic) => (
        <Panel key={epic.name} title={`${epic.key ? `${epic.key} ` : ""}${epic.name}`}>
          <p className="mb-2 text-sm text-muted-foreground">{epic.summary}</p>
          <ul className="space-y-1.5">
            {epic.stories.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm"
              >
                <span className="min-w-0 truncate">
                  {s.key && <span className="mr-2 font-mono text-xs text-muted-foreground">{s.key}</span>}
                  {s.title}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {s.points != null && <span className="text-xs text-muted-foreground">{s.points} pts</span>}
                  {s.status && <StatusBadge tone="neutral">{s.status}</StatusBadge>}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
