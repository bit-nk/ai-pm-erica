import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/pm";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-status-success-bg text-status-success",
  info: "bg-status-info-bg text-status-info",
  warning: "bg-status-warning-bg text-status-warning",
  danger: "bg-status-danger-bg text-status-danger",
  neutral: "bg-status-neutral-bg text-status-neutral",
  na: "bg-status-na-bg text-status-na",
};

/** Pill badge used by every artifact view; maps a StatusTone to theme tokens. */
export function StatusBadge({
  tone, children, className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
