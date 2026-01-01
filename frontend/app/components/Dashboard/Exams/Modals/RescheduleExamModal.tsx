import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface RescheduleExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (startDate: Date, endDate: Date) => void;
    examName: string;
    currentStartDate?: string;
    currentEndDate?: string;
}

export default function RescheduleExamModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    examName,
    currentStartDate,
    currentEndDate
}: RescheduleExamModalProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const [startDate, setStartDate] = useState<Date | undefined>(
        currentStartDate ? new Date(currentStartDate) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        currentEndDate ? new Date(currentEndDate) : undefined
    );
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (startDate && endDate) {
            onConfirm(startDate, endDate);
        }
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return t('exams.modals.reschedule.select_date', 'اختر تاريخ');
        return isRTL 
            ? date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
            : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <img 
                            src="/assets/icons/dashboard/exams/Calendar_red.svg" 
                            alt="calendar" 
                            className="w-8 h-8"
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-dark-navy mb-2">
                    {t('exams.modals.reschedule.title', 'إعادة جدولة الاختبار')}
                </h2>

                {/* Exam Name */}
                <p className="text-center text-navy/70 mb-6">
                    "{examName}"
                </p>

                {/* Date Inputs */}
                <div className="space-y-4 mb-6">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('exams.modals.reschedule.start_date', 'تاريخ البداية')}
                        </label>
                        <button
                            onClick={() => {
                                setShowStartPicker(!showStartPicker);
                                setShowEndPicker(false);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-right hover:border-primary-500 transition-colors"
                        >
                            {formatDate(startDate)}
                        </button>
                        {showStartPicker && (
                            <div className="mt-2 p-2 border rounded-xl bg-white shadow-lg">
                                <DayPicker
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setShowStartPicker(false);
                                    }}
                                    disabled={{ before: new Date() }}
                                />
                            </div>
                        )}
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('exams.modals.reschedule.end_date', 'تاريخ النهاية')}
                        </label>
                        <button
                            onClick={() => {
                                setShowEndPicker(!showEndPicker);
                                setShowStartPicker(false);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-right hover:border-primary-500 transition-colors"
                        >
                            {formatDate(endDate)}
                        </button>
                        {showEndPicker && (
                            <div className="mt-2 p-2 border rounded-xl bg-white shadow-lg">
                                <DayPicker
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date);
                                        setShowEndPicker(false);
                                    }}
                                    disabled={{ before: startDate || new Date() }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-navy rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        {t('common.cancel', 'إلغاء')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!startDate || !endDate}
                        className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('exams.modals.reschedule.confirm', 'حفظ التغييرات')}
                    </button>
                </div>
            </div>
        </div>
    );
}
