import { useCallback } from "react";
import type { ToastType } from "../components/Toast/Toast";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface UseToastOptions {
  toasts: ToastItem[];
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
}

export function useToast({ toasts, setToasts }: UseToastOptions) {
  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastItem = { id, message, type };

      setToasts([...toasts, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    [toasts, setToasts]
  );

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [setToasts]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, "success", duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast(message, "error", duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, "warning", duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, "info", duration),
    [addToast]
  );

  return { addToast, removeToast, success, error, warning, info };
}
