import { useEffect, useState } from "react";
import { Eye, FileDown, FileText, Pencil, Plus } from "lucide-react";
import { useWorkspace, type ArtifactRecord } from "@/store/workspace";
import { STEPS, RECORD_NOUN, EXPORTABLE_SKILLS } from "@/components/onboarding/steps";
import { buildExecution } from "@/components/onboarding/buildArtifact";
import { exportPdf, exportWord } from "@/lib/exportArtifact";
import { skillTitle } from "@/data/demo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SkillId } from "@/types/pm";

/**
 * Center view for multi-record skills (meetings, sprints, checklists, etc.).
 * Lists each record with an editable title + date and per-record actions:
 * Open (show on the canvas), Edit, and - for document skills - Word / PDF.
 */
export function RecordList({ skill }: { skill: SkillId }) {
  const ws = useWorkspace();
  const pid = ws.activeProjectId ?? "";
  const cid = ws.activeClientId ?? "";
  const step = STEPS.find((s) => s.id === skill);
  const noun = (RECORD_NOUN[skill] ?? "Record").toLowerCase();
  const exportable = EXPORTABLE_SKILLS.includes(skill);
  const list = ws.records[pid]?.[skill] ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  // Seed records and show the first one on the canvas when this skill opens.
  useEffect(() => {
    const seeded = ws.ensureRecords(pid, skill);
    const first = seeded[0];
    if (first && step) {
      setSelected(first.id);
      ws.showExecution(buildExecution(step, first.values, cid, pid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, pid]);

  if (!step) return null;

  const open = (r: ArtifactRecord) => { setSelected(r.id); ws.openRecord(pid, skill, r.id); };
  const add = () => { const id = ws.addRecord(pid, skill); ws.beginEdit(skill, id); };
  const doExport = (r: ArtifactRecord, kind: "word" | "pdf") => {
    const md = buildExecution(step, r.values, cid, pid).markdown;
    if (kind === "word") exportWord(r.title, md);
    else exportPdf(r.title, md);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{skillTitle(skill)}</p>
          <p className="text-xs text-muted-foreground">
            {list.length} {noun}{list.length === 1 ? "" : "s"}. Open one to view it on the right, or add a new one.
          </p>
        </div>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> New {noun}
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">No {noun}s yet. Click "New {noun}" to add one.</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="flex items-center gap-3 px-3.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="flex-1">Title</span>
            <span className="w-32">Date</span>
            <span className="ml-auto">Actions</span>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-auto">
            {list.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "rounded-xl border bg-card p-3.5 shadow-card transition-colors",
                  selected === r.id ? "border-accent ring-1 ring-accent/40" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    value={r.title}
                    onChange={(e) => ws.updateRecordMeta(pid, skill, r.id, { title: e.target.value })}
                    className="h-9 min-w-[160px] flex-1 font-medium"
                    title="Record title"
                  />
                  <Input
                    value={r.date}
                    placeholder="Date"
                    onChange={(e) => ws.updateRecordMeta(pid, skill, r.id, { date: e.target.value })}
                    className="h-9 w-32"
                    title="Date"
                  />
                  <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => open(r)}>
                      <Eye className="h-3.5 w-3.5" /> Open
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => ws.beginEdit(skill, r.id)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {exportable && (
                      <>
                        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => doExport(r, "word")} title="Export as Word">
                          <FileText className="h-3.5 w-3.5" /> Word
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => doExport(r, "pdf")} title="Export as PDF">
                          <FileDown className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
