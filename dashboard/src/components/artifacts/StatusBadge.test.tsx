import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/artifacts/StatusBadge";

describe("StatusBadge", () => {
  it("renders its children", () => {
    render(<StatusBadge tone="success">GO</StatusBadge>);
    expect(screen.getByText("GO")).toBeInTheDocument();
  });

  it("applies the tone token classes", () => {
    render(<StatusBadge tone="danger">NO-GO</StatusBadge>);
    expect(screen.getByText("NO-GO").className).toContain("text-status-danger");
  });
});
