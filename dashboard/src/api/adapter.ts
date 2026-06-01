import type { ArtifactPayload, SkillId } from "@/types/pm";

/**
 * Best-effort markdown -> typed payload adapter.
 *
 * The real backend SHOULD return a typed `payload` directly alongside the
 * markdown. This adapter is the fallback for endpoints that only emit markdown:
 * implement per-skill parsers here (parse GFM tables into rows, etc.).
 *
 * Returning `undefined` is always safe - the ArtifactViewer then renders the
 * markdown / TipTap view instead of a bespoke visual component.
 */
export function adaptArtifact(skill: SkillId, _markdown: string): ArtifactPayload | undefined {
  switch (skill) {
    // TODO: add parsers, e.g.
    //   case "risk-scan":         return parseRiskScan(_markdown);
    //   case "release-checklist": return parseReleaseChecklist(_markdown);
    //   case "decision-log":      return parseDecisionLog(_markdown);
    //   case "sprint-planning":   return parseSprintPlan(_markdown);
    default:
      return undefined;
  }
}
