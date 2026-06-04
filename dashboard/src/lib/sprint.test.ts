import { describe, it, expect } from "vitest";
import { loadStatus } from "@/lib/sprint";

describe("loadStatus (sprint overcommit calc)", () => {
  it("flags overcommitment above the 80% band", () => {
    expect(loadStatus(10, 9).overcommitted).toBe(true);
  });

  it("stays within the band at 75%", () => {
    const s = loadStatus(20, 15);
    expect(s.pct).toBe(75);
    expect(s.overcommitted).toBe(false);
  });

  it("treats exactly 80% as not overcommitted", () => {
    expect(loadStatus(10, 8).overcommitted).toBe(false);
  });

  it("handles zero capacity without dividing by zero", () => {
    expect(loadStatus(0, 5).ratio).toBe(0);
  });
});
