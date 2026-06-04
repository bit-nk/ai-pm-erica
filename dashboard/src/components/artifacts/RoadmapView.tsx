import { type RoadmapPayload, type RoadmapTask } from "@/types/pm";
import { cn } from "@/lib/utils";

/** Lane accent colours, cycled by index. */
const LANE_BAR = [
  "bg-status-info text-white",
  "bg-status-success text-white",
  "bg-status-warning text-foreground",
  "bg-accent text-accent-foreground",
];

const tip = (t: RoadmapTask) => {
  const weeks = `Week ${t.startWeek} to Week ${t.endWeek}`;
  if (t.startDate && t.endDate) return `${t.startDate} to ${t.endDate}  (${weeks})`;
  if (t.startDate) return `From ${t.startDate}  (${weeks})`;
  return weeks;
};

/**
 * /roadmap : a sprint/week timeline. Weeks are columns with dotted gridlines;
 * each task is a bar spanning its start..end week, grouped under its lane.
 * Hovering a bar shows its dates (or week range).
 */
export function RoadmapView({ payload }: { payload: RoadmapPayload }) {
  const weeks = Math.max(1, payload.weeks);
  const weekCols = Array.from({ length: weeks }, (_, i) => i + 1);
  const gridCols = `minmax(120px,1.4fr) repeat(${weeks}, minmax(28px,1fr))`;
  const laneColor = (lane: string) => LANE_BAR[payload.lanes.indexOf(lane) % LANE_BAR.length] ?? LANE_BAR[0];

  // A week cell with a dotted left gridline (skipped on the first week column).
  const cellLine = (w: number) => cn("h-6 self-stretch", w > 1 && "border-l border-dashed border-border");

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">{payload.goal}</p>
        {payload.horizon && <p className="text-sm text-muted-foreground">Horizon: {payload.horizon}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card p-3 shadow-card">
        <div className="min-w-[460px]">
          {/* Week header */}
          <div className="grid items-end gap-0 border-b border-dashed border-border pb-2" style={{ gridTemplateColumns: gridCols }}>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Task</span>
            {weekCols.map((w) => (
              <span key={w} className={cn("text-center text-[10px] text-muted-foreground", w > 1 && "border-l border-dashed border-border")}>W{w}</span>
            ))}
          </div>

          {/* Lanes with their tasks */}
          {payload.lanes.map((lane, li) => {
            const tasks = payload.tasks.filter((t) => t.lane === lane);
            if (!tasks.length) return null;
            return (
              <div key={lane} className={cn(li > 0 && "border-t border-dashed border-border")}>
                <p className="px-0 pb-1 pt-2 text-xs font-semibold">{lane}</p>
                <div>
                  {tasks.map((t, i) => (
                    <div
                      key={i}
                      className={cn("grid items-center gap-0 border-b border-dotted border-border/60 py-0.5 last:border-0")}
                      style={{ gridTemplateColumns: gridCols }}
                    >
                      <span className="truncate pr-2 text-xs" title={t.name}>{t.name}</span>
                      {weekCols.map((w) => {
                        const inBar = w >= t.startWeek && w <= t.endWeek;
                        return (
                          <div key={w} className={cn(cellLine(w), "flex items-center")}>
                            {inBar && (
                              <div
                                title={`${t.name} - ${tip(t)}`}
                                className={cn(
                                  "h-3.5 w-full cursor-default",
                                  laneColor(lane),
                                  w === t.startWeek && "rounded-l-full",
                                  w === t.endWeek && "rounded-r-full",
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lane legend */}
      <div className="flex flex-wrap gap-2">
        {payload.lanes.map((lane) => (
          <span key={lane} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("h-2.5 w-4 rounded-full", laneColor(lane))} />
            {lane}
          </span>
        ))}
      </div>
    </div>
  );
}
