import { useTranslation } from "react-i18next";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: "template" | "exam";
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: DeleteConfirmModalProps) {
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
          <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-primary-800 text-center mb-2">
          {itemType === "template" 
            ? t("templates.deleteModal.title", "حذف القالب")
            : t("exams.deleteModal.title", "حذف الإمتحان")
          }
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {itemType === "template"
            ? t("templates.deleteModal.message", "هل أنت متأكد من حذف القالب \"{{name}}\"؟ هذا الإجراء لا يمكن التراجع عنه.", { name: itemName })
            : t("exams.deleteModal.message", "هل أنت متأكد من حذف الإمتحان \"{{name}}\"؟ هذا الإجراء لا يمكن التراجع عنه.", { name: itemName })
          }
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
            className="flex-1 px-4 py-2.5 bg-red text-white rounded-xl font-medium hover:bg-red/90 transition-colors"
          >
            {t("common.delete", "حذف")}
          </button>
        </div>
      </div>
    </div>
  );
}
