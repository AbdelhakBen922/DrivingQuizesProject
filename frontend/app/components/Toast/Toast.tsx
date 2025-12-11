import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  id,
  message,
  type,
  duration = 3000,
  onClose,
}: ToastProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    success: {
      bgColor: "bg-green/10",
      textColor: "text-green",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    error: {
      bgColor: "bg-red/10",
      textColor: "text-red",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    warning: {
      bgColor: "bg-yellow/10",
      textColor: "text-yellow",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18z"
          />
        </svg>
      ),
    },
    info: {
      bgColor: "bg-primary-100",
      textColor: "text-primary-800",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`
        animate-slideUp flex items-center gap-3 px-4 py-3 rounded-xl
        ${styles.bgColor}
        ${isRTL ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      <div className={styles.textColor}>{styles.icon}</div>
      <p className={`text-sm font-semibold ${styles.textColor}`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`ml-auto p-1 hover:opacity-70 transition-opacity ${styles.textColor} ${isRTL ? 'mr-auto ml-0' : ''}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
