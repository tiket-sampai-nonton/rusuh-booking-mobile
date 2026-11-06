import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { ToastItem } from "../ToastItem";
import type { ToastData, ToastVariant } from "../types";

const DEFAULT_DURATION_MS = 3000;

interface ToastContextValue {
  readonly show: (
    message: string,
    variant?: ToastVariant,
    duration?: number,
  ) => void;
  readonly hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  readonly children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback(
    (
      message: string,
      variant: ToastVariant = "default",
      duration = DEFAULT_DURATION_MS,
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, message, variant, duration }]);
    },
    [],
  );

  const hide = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => hide(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}
