import type { OrchestratorApi } from "@/api/orchestrator";
import { mockApi } from "@/api/mockOrchestrator";
import { realApi } from "@/api/realOrchestrator";

/** Flip to the real backend with VITE_USE_REAL_API=true; mock is the default. */
const USE_REAL = import.meta.env.VITE_USE_REAL_API === "true";

export const orchestratorApi: OrchestratorApi = USE_REAL ? realApi : mockApi;

export { mockApi, realApi };
export type { OrchestratorApi };
