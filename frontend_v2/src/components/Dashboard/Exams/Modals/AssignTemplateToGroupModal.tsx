import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import * as api from "../../../../services/api";

interface AssignTemplateToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        groupId: string;
        startDate: Date;
        endDate: Date;
        examName: string;
    }) => void;
    templateName: string;
    templateId: string;
}

export default function AssignTemplateToGroupModal({
    isOpen,
    onClose,
    onConfirm,
    templateName,
    // templateId,
}: AssignTemplateToGroupModalProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    
    const [groups, setGroups] = useState<api.Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [examName, setExamName] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Load groups when modal opens
    useEffect(() => {
        if (isOpen) {
            loadGroups();
            setExamName(`${templateName} - ${new Date().toLocaleDateString()}`);
        }
    }, [isOpen, templateName]);

    async function loadGroups() {
        try {
            setLoading(true);
            const rooms = await api.getRooms();
            setGroups(rooms);
        } catch (err) {
            console.error('Failed to load groups:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirm = () => {
        if (!selectedGroupId || !startDate || !endDate || !examName) return;
        
        onConfirm({
            groupId: selectedGroupId,
            startDate,
            endDate,
            examName,
        });
        
        // Reset form
        setSelectedGroupId("");
        setExamName("");
        setStartDate(undefined);
        setEndDate(undefined);
        onClose();
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return t('templates.assignModal.selectDate', 'اختر تاريخ');
        return isRTL 
            ? date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
            : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-dark-navy mb-2">
                    {t('templates.assignModal.title', 'تعيين قالب لمجموعة')}
                </h2>

                {/* Template Name */}
                <p className="text-center text-navy/70 mb-6">
                    "{templateName}"
                </p>

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Exam Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('templates.assignModal.examName', 'اسم الامتحان')}
                        </label>
                        <input
                            type="text"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 outline-none transition-colors"
                            placeholder={t('templates.assignModal.examNamePlaceholder', 'أدخل اسم الامتحان')}
                        />
                    </div>

                    {/* Group Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('templates.assignModal.selectGroup', 'اختر المجموعة')}
                        </label>
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 outline-none transition-colors"
                            disabled={loading}
                        >
                            <option value="">
                                {loading 
                                    ? t('common.loading', 'جاري التحميل...') 
                                    : t('templates.assignModal.selectGroupPlaceholder', 'اختر مجموعة...')}
                            </option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('templates.assignModal.startDate', 'تاريخ البداية')}
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
                            {t('templates.assignModal.endDate', 'تاريخ النهاية')}
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
                <div className={`flex gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-navy rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        {t('common.cancel', 'إلغاء')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedGroupId || !startDate || !endDate || !examName}
                        className="flex-1 px-6 py-3 bg-green text-white rounded-xl font-semibold hover:bg-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('templates.assignModal.confirm', 'تعيين')}
                    </button>
                </div>
            </div>
        </div>
    );
}
