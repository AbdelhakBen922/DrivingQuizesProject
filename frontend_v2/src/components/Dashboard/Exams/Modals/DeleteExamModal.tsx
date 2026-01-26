import { useTranslation } from "react-i18next";

interface DeleteExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    examName: string;
}

export default function DeleteExamModal({ isOpen, onClose, onConfirm, examName }: DeleteExamModalProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-dark-navy mb-3">
                    {t('exams.modals.delete_exam.title', 'حذف الاختبار')}
                </h2>

                {/* Message */}
                <p className="text-center text-navy/70 mb-2">
                    {t('exams.modals.delete_exam.message', 'هل أنت متأكد من حذف الاختبار')} "{examName}"؟
                </p>
                
                <p className="text-center text-red/80 text-sm mb-6">
                    {t('exams.modals.delete_exam.warning', 'هذا الإجراء لا يمكن التراجع عنه')}
                </p>

                {/* Buttons */}
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-navy rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        {t('common.cancel', 'إلغاء')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 bg-red text-white rounded-lg font-semibold hover:bg-red/90 transition-colors"
                    >
                        {t('exams.modals.delete_exam.confirm', 'حذف')}
                    </button>
                </div>
            </div>
        </div>
    );
}
