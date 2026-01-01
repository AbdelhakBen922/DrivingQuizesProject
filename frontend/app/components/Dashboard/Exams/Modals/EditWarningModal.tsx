import { useTranslation } from "react-i18next";

interface EditWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  examName: string;
}

export default function EditWarningModal({
  isOpen,
  onClose,
  onConfirm,
  examName,
}: EditWarningModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 ${isRTL ? "text-right" : "text-left"}`}>
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-primary-800 text-center mb-2">
          {t("exams.editWarningModal.title", "تعديل إمتحان نشط")}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {t("exams.editWarningModal.message", "الإمتحان \"{{name}}\" نشط حالياً. تعديله قد يؤثر على الطلاب الذين يجتازونه. هل تريد المتابعة؟", { name: examName })}
        </p>

        {/* Actions */}
        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {t("common.cancel", "إلغاء")}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-yellow text-white rounded-xl font-medium hover:bg-yellow/90 transition-colors"
          >
            {t("exams.editWarningModal.continue", "متابعة التعديل")}
          </button>
        </div>
      </div>
    </div>
  );
}
