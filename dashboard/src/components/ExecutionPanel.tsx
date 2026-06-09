import { useCallback } from "react";
import { OrchestratorConsole } from "@/components/OrchestratorConsole";
import { ArtifactEditor } from "@/components/ArtifactEditor";
import { RecordList } from "@/components/RecordList";
import { getOrchestratorApi } from "@/api";
import { useWorkspace } from "@/store/workspace";
import { MULTI_RECORD_SKILLS } from "@/components/onboarding/steps";
import { cn } from "@/lib/utils";
import type { SkillExecution, SkillId } from "@/types/pm";

/** Demo text loaded into the Finwave project only (shown as a one-click example). */
const DEMO_INPUT =
  "From Sarah Chen (Head of Product): Our enterprise clients keep finding out about " +
  "failed payments only when their own customers call them. We need real-time payment " +
  "notifications before the conference in 6 weeks. Budget is around $80k.";

export function ExecutionPanel() {
  const ws = useWorkspace();
  const editing = ws.editingSkill;
  const { activeProjectId, completeOrchestration } = ws;

  // Resolve the orchestrator at render time so it picks up a newly-saved Claude key
  // without requiring a page reload.
  const api = getOrchestratorApi();

  const onComplete = useCallback(
    (
      decisions: Parameters<typeof completeOrchestration>[1],
      claudeExecutions?: Partial<Record<SkillId, SkillExecution>>,
    ) => {
      if (activeProjectId) completeOrchestration(activeProjectId, decisions, claudeExecutions);
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
          api={api}
          onViewSkill={ws.previewSkill}
          onComplete={onComplete}
          onVizDecision={(approved) => { if (ws.activeProjectId) ws.setRiskViz(ws.activeProjectId, approved); }}
          orchestrated={!!ws.activeProjectId && ws.orchestratedProjects.includes(ws.activeProjectId)}
          defaultInput={ws.activeProjectId === "p-notifications" ? DEMO_INPUT : ""}
        />
      </div>
    </div>
  );
}
