import { useCallback, useEffect, useReducer, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  type OrchestrationPlan,
  type PlanStep,
  type PlanStepState,
  type SkillExecutionRequest,
  type SkillId,
} from "@/types/pm";
import { type OrchestratorApi } from "@/api/orchestrator";
import { skillTitle } from "@/data/demo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * OrchestratorConsole - the "/pm" console.
 *
 * Flow:
 *   1. Paste a message / drop a transcript -> Run orchestrator -> a plan appears.
 *   2. Every suggested step starts Approved; the user toggles Approve/Skip
 *      (reversible) per step. Nothing is generated yet.
 *   3. "Complete Orchestration" -> the AI generates the approved sections;
 *      skipped sections are created blank (addable later from the left nav).
 */

type Decision = "approved" | "skipped";

export interface OrchestratorConsoleProps {
  clientId?: string;
  projectId?: string;
  api: OrchestratorApi;
  /** View a generated (or blank) section in the canvas after completion. */
  onViewSkill?: (skill: SkillId) => void;
  /** Finish: hand the per-skill decisions to the store to generate artifacts. */
  onComplete?: (decisions: Record<SkillId, Decision>) => void;
  /** True when this project's orchestration is already done (shows a hub). */
  orchestrated?: boolean;
  /** Pre-fill the input box (mock/demo). */
  defaultInput?: string;
}

/* ----------------------------- reducer ----------------------------- */

interface PlanState { plan: OrchestrationPlan | null; }
type PlanAction =
  | { type: "set-plan"; plan: OrchestrationPlan }
  | { type: "set-step"; stepId: string; state: PlanStepState }
  | { type: "reset" };

function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "set-plan":
      return { plan: action.plan };
    case "set-step":
      if (!state.plan) return state;
      return {
        plan: {
          ...state.plan,
          steps: state.plan.steps.map((s) => (s.id === action.stepId ? { ...s, state: action.state } : s)),
        },
      };
    case "reset":
      return { plan: null };
    default:
      return state;
  }
}

/* ----------------------------- component ----------------------------- */

export function OrchestratorConsole({
  clientId, projectId, api, onViewSkill, onComplete, orchestrated, defaultInput = "",
}: OrchestratorConsoleProps) {
  const [input, setInput] = useState(defaultInput);
  const [dragging, setDragging] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [{ plan }, dispatch] = useReducer(planReducer, { plan: null });
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rerun, setRerun] = useState(false);

  // Switching projects clears any in-progress plan (state is per project).
  useEffect(() => {
    dispatch({ type: "reset" });
    setCompleted(false);
    setRerun(false);
  }, [projectId]);

  const canRun = Boolean(input.trim() && clientId && projectId);

  // Already-orchestrated project with no active plan -> show the hub, not the plan.
  const showHub = !!orchestrated && !plan && !rerun;

  /* --- Run the orchestrator: build the plan (every step starts Approved) --- */
  const planMutation = useMutation({
    mutationFn: async () => {
      const req: SkillExecutionRequest = {
        skill: "pm",
        clientId: clientId!,
        projectId: projectId!,
        input: input.trim(),
        attachments: attachments.map((f, i) => ({
          id: `att-${i}`, name: f.name, mimeType: f.type, sizeBytes: f.size,
        })),
      };
      return api.planOrchestration(req);
    },
    onSuccess: (p) => {
      dispatch({
        type: "set-plan",
        plan: { ...p, steps: p.steps.map((s) => ({ ...s, state: "approved" as PlanStepState })) },
      });
      setCompleted(false);
    },
  });

  const setDecision = useCallback((step: PlanStep, state: PlanStepState) => {
    dispatch({ type: "set-step", stepId: step.id, state });
  }, []);

  /* --- Complete: "generate" the approved sections, leave skipped ones blank --- */
  const complete = async () => {
    if (!plan) return;
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 700)); // simulate AI generation
    const decisions = Object.fromEntries(
      plan.steps.map((s) => [s.skill, s.state === "skipped" ? "skipped" : "approved"]),
    ) as Record<SkillId, Decision>;
    onComplete?.(decisions);
    setCompleting(false);
    setCompleted(true);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setAttachments((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const reset = () => {
    dispatch({ type: "reset" });
    planMutation.reset();
    setInput("");
    setAttachments([]);
    setCompleted(false);
  };

  const approvedCount = plan ? plan.steps.filter((s) => s.state !== "skipped").length : 0;
  const skippedCount = plan ? plan.steps.length - approvedCount : 0;

  if (showHub) return <OrchestratedHub onRerun={() => setRerun(true)} />;

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- Input surface (drag-drop + paste) ---------- */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border bg-card p-4 shadow-card transition-colors",
          dragging ? "border-accent ring-2 ring-accent/40" : "border-border",
        )}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="Paste a client message, meeting transcript, or brief - or drop a .txt/.md transcript here."
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        {attachments.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {attachments.map((f, i) => (
              <li key={i} className="rounded-md border border-border bg-muted px-2 py-1 text-xs">{f.name}</li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {clientId && projectId ? "Orchestrator will plan the right skills." : "Select a client & project to begin."}
          </p>
          <div className="flex gap-2">
            {plan && <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>}
            <Button size="sm" disabled={!canRun || planMutation.isPending} onClick={() => planMutation.mutate()}>
              {planMutation.isPending ? "Planning..." : "Run orchestrator"}
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- Planning state ---------- */}
      {planMutation.isPending && <PlanSkeleton />}
      {planMutation.isError && (
        <ErrorCard message={(planMutation.error as Error).message} onRetry={() => planMutation.mutate()} />
      )}

      {/* ---------- Step-by-step plan (decide, then complete) ---------- */}
      {plan && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Orchestration Plan</h3>
            <Badge variant="outline" className="text-[11px]">{plan.steps.length} steps</Badge>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{plan.summary}</p>

          <ol className="relative space-y-2 pl-6">
            <span className="absolute left-[9px] top-1 bottom-1 w-px bg-border" aria-hidden />
            <AnimatePresence initial={false}>
              {plan.steps.map((step, i) => (
                <motion.li
                  key={step.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 32 }}
                >
                  <StepCard
                    step={step}
                    index={i}
                    completed={completed}
                    onApprove={() => setDecision(step, "approved")}
                    onSkip={() => setDecision(step, "skipped")}
                    onView={() => onViewSkill?.(step.skill)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          {/* ---------- Complete / completed footer ---------- */}
          {!completed ? (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {approvedCount} approved, {skippedCount} skipped. Skipped sections are created blank and can be added later.
              </p>
              <Button size="sm" onClick={complete} disabled={completing}>
                {completing ? "Generating..." : "Complete Orchestration"}
              </Button>
            </div>
          ) : (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-status-success">
                Orchestration complete. Approved sections generated; skipped ones are blank. Pick a skill on the left - skipped ones can be generated from there anytime.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- step card ----------------------------- */

const STEP_DOT: Record<PlanStepState, string> = {
  pending: "border-border bg-card",
  approved: "border-status-info bg-status-info-bg",
  running: "border-status-info bg-status-info animate-pulse",
  done: "border-status-success bg-status-success",
  skipped: "border-status-na bg-status-na-bg",
  failed: "border-status-danger bg-status-danger",
};

const SEG = "rounded px-2.5 py-1 text-xs font-medium transition-colors";

function StepCard({
  step, index, completed, onApprove, onSkip, onView,
}: {
  step: PlanStep;
  index: number;
  completed: boolean;
  onApprove: () => void;
  onSkip: () => void;
  onView: () => void;
}) {
  const approved = step.state !== "skipped";
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <span
        className={cn(
          "absolute -left-[3px] mt-1 grid h-[18px] w-[18px] -translate-x-1/2 place-items-center rounded-full border-2",
          STEP_DOT[step.state],
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{index + 1}</span>
            <span className="text-sm font-medium">{skillTitle(step.skill)}</span>
            {step.parallelizable && <Badge variant="outline" className="text-[10px]">parallel</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{step.rationale}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!completed ? (
            // Reversible Approve / Skip toggle - click either at any time.
            <div className="flex rounded-md border border-border p-0.5" role="group" aria-label="Approve or skip">
              <button
                type="button"
                onClick={onApprove}
                aria-pressed={approved}
                className={cn(SEG, approved ? "bg-status-success-bg text-status-success" : "text-muted-foreground hover:bg-muted")}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={onSkip}
                aria-pressed={!approved}
                className={cn(SEG, !approved ? "bg-status-na-bg text-status-na" : "text-muted-foreground hover:bg-muted")}
              >
                Skip
              </button>
            </div>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onView}>View</Button>
              {approved
                ? <Badge className="bg-status-success-bg text-status-success">Generated</Badge>
                : <Badge className="bg-status-na-bg text-status-na">Skipped</Badge>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */

function OrchestratedHub({ onRerun }: { onRerun: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <p className="text-sm font-semibold">Project orchestrated</p>
      <p className="mt-1 text-sm text-muted-foreground">
        This project is set up. Pick a skill on the left to view or edit it - skipped sections are marked and can be added anytime.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRerun}>Re-run orchestration</Button>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-card">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-status-danger/40 bg-status-danger-bg p-4">
      <p className="text-sm text-status-danger">{message}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
    </div>
  );
}
