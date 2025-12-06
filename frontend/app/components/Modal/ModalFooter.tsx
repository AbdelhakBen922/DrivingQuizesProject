import { useTranslation } from "react-i18next";
import type { ModalFooterProps } from "./types";

export default function ModalFooter({ children, className = "" }: ModalFooterProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div 
      className={`
        flex items-center gap-3 px-6 py-4 border-t border-gray-100
        ${isRTL ? 'flex-row-reverse' : 'flex-row'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
