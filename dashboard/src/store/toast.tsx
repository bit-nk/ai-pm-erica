import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface Toast {
  id: number;
  title: string;
  tone?: "success" | "danger" | "info";
}

const ToastContext = createContext<{
  toasts: Toast[];
  notify: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}>({ toasts: [], notify: () => {}, dismiss: () => {} });

let seq = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = seq++;
      setToasts((ts) => [...ts, { ...t, id }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return <ToastContext.Provider value={{ toasts, notify, dismiss }}>{children}</ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
