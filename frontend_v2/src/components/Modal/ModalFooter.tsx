import { useTranslation } from "react-i18next";
import type { ModalFooterProps } from "./types";

export default function ModalFooter({ children, className = "" }: ModalFooterProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div 
      className={`
        flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100
        ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
