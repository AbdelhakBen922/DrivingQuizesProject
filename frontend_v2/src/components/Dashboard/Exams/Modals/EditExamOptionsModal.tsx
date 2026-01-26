import { useTranslation } from "react-i18next";

interface EditExamOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReschedule: () => void;
    onEditQuestions: () => void;
    onDelete: () => void;
    examName: string;
    examStatus: "active" | "closed" | "scheduled";
}

export default function EditExamOptionsModal({ 
    isOpen, 
    onClose, 
    onReschedule,
    onEditQuestions,
    onDelete,
    examName,
    examStatus 
}: EditExamOptionsModalProps) {
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
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <img 
                            src="/assets/icons/dashboard/exams/Edit_Pencil_01.svg" 
                            alt="edit" 
                            className="w-8 h-8"
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-dark-navy mb-2">
                    {t('exams.modals.edit_exam.title', 'تعديل الاختبار')}
                </h2>

                {/* Exam Name */}
                <p className="text-center text-navy/70 mb-6">
                    "{examName}"
                </p>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {/* Reschedule Option */}
                    <button
                        onClick={onReschedule}
                        className={`w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <img 
                                src="/assets/icons/dashboard/exams/Calendar_red.svg" 
                                alt="calendar" 
                                className="w-5 h-5"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-dark-navy">
                                {t('exams.modals.edit_exam.reschedule', 'إعادة جدولة')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {t('exams.modals.edit_exam.reschedule_desc', 'تغيير تاريخ البداية والنهاية')}
                            </p>
                        </div>
                    </button>

                    {/* Edit Questions Option */}
                    <button
                        onClick={onEditQuestions}
                        className={`w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <img 
                                src="/assets/icons/dashboard/exams/template.svg" 
                                alt="template" 
                                className="w-5 h-5"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-dark-navy">
                                {t('exams.modals.edit_exam.edit_questions', 'تعديل الأسئلة')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {t('exams.modals.edit_exam.edit_questions_desc', 'تعديل أسئلة القالب المرتبط')}
                            </p>
                        </div>
                    </button>

                    {/* Delete Option */}
                    <button
                        onClick={onDelete}
                        className={`w-full flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl hover:border-red hover:bg-red-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-red">
                                {t('exams.modals.edit_exam.delete', 'حذف الاختبار')}
                            </p>
                            <p className="text-sm text-red/70">
                                {t('exams.modals.edit_exam.delete_desc', 'حذف هذا الاختبار نهائياً')}
                            </p>
                        </div>
                    </button>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-navy rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                    {t('common.cancel', 'إلغاء')}
                </button>
            </div>
        </div>
    );
}
