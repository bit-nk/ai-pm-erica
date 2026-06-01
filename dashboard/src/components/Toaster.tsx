import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";

const TONE: Record<NonNullable<ReturnType<typeof useToast>["toasts"][number]["tone"]>, string> = {
  success: "border-status-success/30 bg-status-success-bg text-status-success",
  danger: "border-status-danger/30 bg-status-danger-bg text-status-danger",
  info: "border-status-info/30 bg-status-info-bg text-status-info",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-72 flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className={cn(
              "pointer-events-auto rounded-lg border bg-card px-3 py-2 text-left text-sm shadow-pop",
              t.tone ? TONE[t.tone] : "border-border",
            )}
          >
            {t.title}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
