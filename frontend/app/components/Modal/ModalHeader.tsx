import { useTranslation } from "react-i18next";
import type { ModalHeaderProps } from "./types";

export default function ModalHeader({
  title,
  subtitle,
  icon,
  onClose,
  centered = false,
  type = "standard",
}: ModalHeaderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const typeStyles = {
    standard: {
      title: "text-primary-800",
      border: "border-primary-300",
      iconBg: "bg-primary-100",
    },
    success: {
      title: "text-green",
      border: "border-green",
      iconBg: "bg-green/10",
    },
    error: {
      title: "text-red",
      border: "border-red",
      iconBg: "bg-red/10",
    },
    warning: {
      title: "text-yellow",
      border: "border-yellow",
      iconBg: "bg-yellow/10",
    },
  };

  const styles = typeStyles[type];

  return (
    <div className={`relative px-6 pt-6 pb-4 border-b border-gray-100`}>
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={`
            absolute top-4 p-2 rounded-lg
            hover:bg-gray-100 transition-colors
            ${isRTL ? 'left-4' : 'right-4'}
          `}
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-grey"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className={`${centered ? 'text-center' : isRTL ? 'text-right' : 'text-left'}`}>
        {/* Icon */}
        {icon && (
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center border-2 ${styles.border}`}>
              {icon}
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className={`text-2xl font-bold ${styles.title} mb-2`}>
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-grey text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
