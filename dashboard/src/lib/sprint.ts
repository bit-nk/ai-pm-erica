/** Sprint load math shared by the planning form and view (single source). */
export interface LoadStatus {
  ratio: number;
  pct: number;
  overcommitted: boolean;
}

/** committed = P0 + P1 (stretch excluded). Overcommit when above the 80% band. */
export function loadStatus(usableCapacity: number, committed: number): LoadStatus {
  const ratio = usableCapacity > 0 ? committed / usableCapacity : 0;
  return { ratio, pct: Math.round(ratio * 100), overcommitted: ratio > 0.8 };
}
