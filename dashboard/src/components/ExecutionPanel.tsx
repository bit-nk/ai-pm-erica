import { useCallback } from "react";
import { OrchestratorConsole } from "@/components/OrchestratorConsole";
import { ArtifactEditor } from "@/components/ArtifactEditor";
import { RecordList } from "@/components/RecordList";
import { orchestratorApi } from "@/api";
import { useWorkspace } from "@/store/workspace";
import { MULTI_RECORD_SKILLS } from "@/components/onboarding/steps";
import { cn } from "@/lib/utils";

/** Pre-filled sample so the orchestrator demo runs with one click. */
const DEMO_INPUT =
  "From Sarah Chen (Head of Product): Our enterprise clients keep finding out about " +
  "failed payments only when their own customers call them. We need real-time payment " +
  "notifications before the conference in 6 weeks. Budget is around $80k.";

/**
 * Center column. Normally the orchestrator console. When the user hits "Edit"
 * it swaps to the structured editor; for multi-record skills it shows the
 * record list. The console stays mounted (hidden) so an in-progress plan
 * survives those swaps.
 */
export function ExecutionPanel() {
  const ws = useWorkspace();
  const editing = ws.editingSkill;
  const { activeProjectId, completeOrchestration } = ws;

  const onComplete = useCallback(
    (decisions: Parameters<typeof completeOrchestration>[1]) => {
      if (activeProjectId) completeOrchestration(activeProjectId, decisions);
    },
    [activeProjectId, completeOrchestration],
  );

  const recordSkill = !editing && ws.activeSkill && MULTI_RECORD_SKILLS.includes(ws.activeSkill) ? ws.activeSkill : null;
  const consoleHidden = !!editing || !!recordSkill;

  return (
    <div className="h-full">
      {editing && <ArtifactEditor skill={editing} />}
      {recordSkill && <RecordList skill={recordSkill} />}

      <div className={cn("h-full", consoleHidden && "hidden")}>
        <OrchestratorConsole
          clientId={ws.activeClientId}
          projectId={ws.activeProjectId}
          api={orchestratorApi}
          onViewSkill={ws.previewSkill}
          onComplete={onComplete}
          orchestrated={!!ws.activeProjectId && ws.orchestratedProjects.includes(ws.activeProjectId)}
          defaultInput={DEMO_INPUT}
        />
      </div>
    </div>
  );
}
