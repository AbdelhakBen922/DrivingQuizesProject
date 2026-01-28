import { useTranslation } from "react-i18next";
import Toast from "./Toast";
import type { ToastType } from "./Toast";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const { i18n: _i18n } = useTranslation();


  return (
    <div
      className={`
        fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-sm pointer-events-none
      `}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
}
