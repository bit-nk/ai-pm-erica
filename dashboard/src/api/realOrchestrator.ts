import type { OrchestratorApi } from "@/api/orchestrator";
import type { ExecutionChunk, OrchestrationPlan, SkillExecution } from "@/types/pm";
import { apiFetch, BASE_URL } from "@/api/client";
import { adaptArtifact } from "@/api/adapter";

/**
 * Real backend implementation (boilerplate - not wired by default).
 * Expects:
 *   POST {BASE}/orchestrate/plan          -> OrchestrationPlan (JSON)
 *   POST {BASE}/orchestrate/step  (SSE)   -> stream of `data: <ExecutionChunk>`,
 *                                            final chunk may carry `.execution`.
 * Activate with VITE_USE_REAL_API=true (see api/index.ts). The mock stays the
 * default so the app runs with zero backend.
 */
export const realApi: OrchestratorApi = {
  async planOrchestration(req) {
    return apiFetch<OrchestrationPlan>("/orchestrate/plan", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async streamStep(planId, step, onChunk, signal) {
    const res = await fetch(`${BASE_URL}/orchestrate/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ planId, stepId: step.id, skill: step.skill }),
      signal,
    });
    if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let markdown = "";
    let buffer = "";
    let final: SkillExecution | undefined;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const line = frame.replace(/^data:\s*/, "").trim();
        if (!line) continue;
        const chunk = JSON.parse(line) as ExecutionChunk & { execution?: SkillExecution };
        if (chunk.delta) markdown += chunk.delta;
        onChunk(chunk);
        if (chunk.execution) final = chunk.execution;
      }
    }

    if (final) return final;
    // No terminal execution frame: synthesise one from the accumulated markdown.
    return {
      id: `exec-${step.id}`,
      request: { skill: step.skill, clientId: "", projectId: "", input: "" },
      status: "complete",
      markdown,
      payload: adaptArtifact(step.skill, markdown),
    };
  },
};
