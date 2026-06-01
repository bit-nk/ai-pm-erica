import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Titled card wrapper shared by the chart-based artifact views. */
export function Panel({
  title, children, className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      {title && <p className="border-b border-border px-3 py-2 text-sm font-semibold">{title}</p>}
      <div className="p-3">{children}</div>
    </div>
  );
}
