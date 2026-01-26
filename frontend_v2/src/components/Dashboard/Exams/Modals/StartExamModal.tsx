import { useTranslation } from "react-i18next";

interface StartExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    examName: string;
}

export default function StartExamModal({ isOpen, onClose, onConfirm, examName }: StartExamModalProps) {
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
                    <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center">
                        <img 
                            src="/assets/icons/dashboard/exams/Timer_Add.svg" 
                            alt="start" 
                            className="w-10 h-10"
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-dark-navy mb-3">
                    {t('exams.modals.start_exam.title', 'بدء الاختبار')}
                </h2>

                {/* Message */}
                <p className="text-center text-navy/70 mb-6">
                    {t('exams.modals.start_exam.message', 'هل أنت متأكد من بدء الاختبار')} "{examName}"؟
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
                        className="flex-1 px-6 py-3 bg-green text-white rounded-lg font-semibold hover:bg-green/90 transition-colors"
                    >
                        {t('exams.modals.start_exam.confirm', 'بدء الآن')}
                    </button>
                </div>
            </div>
        </div>
    );
}
