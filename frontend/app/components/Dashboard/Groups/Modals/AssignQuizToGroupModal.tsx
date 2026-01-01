import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { DayPicker } from "react-day-picker";
import { ar, fr } from "date-fns/locale";
import "react-day-picker/style.css";
import * as api from "../../../../services/api";

interface AssignQuizToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupName: string;
  onSuccess?: () => void;
}

export default function AssignQuizToGroupModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: AssignQuizToGroupModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  
  const [examName, setExamName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | "new" | "">("");
  const [templates, setTemplates] = useState<(api.QuizTemplate & { isDefault?: boolean })[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const [owned, defaults] = await Promise.all([
        api.getQuizTemplates(),
        api.getDefaultQuizTemplates(),
      ]);
      setTemplates([
        ...owned.map((t) => ({ ...t, isDefault: false })),
        ...defaults.map((t) => ({ ...t, isDefault: true })),
      ]);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleConfirm = async () => {
    if (!examName.trim()) {
      alert(t("groups.assignQuiz.examNameRequired", "الرجاء إدخال اسم الامتحان"));
      return;
    }

    if (!selectedTemplate) {
      alert(t("groups.assignQuiz.templateRequired", "الرجاء اختيار قالب أو إنشاء جديد"));
      return;
    }

    if (!startDate || !endDate) {
      alert(t("groups.assignQuiz.datesRequired", "الرجاء اختيار تواريخ البداية والنهاية"));
      return;
    }

    if (endDate <= startDate) {
      alert(t("groups.assignQuiz.invalidDates", "تاريخ النهاية يجب أن يكون بعد تاريخ البداية"));
      return;
    }

    // If user chose to create new template
    if (selectedTemplate === "new") {
      // Save pending assignment to localStorage
      const pendingAssignment = {
        groupId: groupId.toString(),
        groupName,
        examName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      localStorage.setItem("pendingExamAssignment", JSON.stringify(pendingAssignment));
      
      // Navigate to template creation with returnToAssign flag
      navigate("/dashboard/templates/create?returnToAssign=true");
      return;
    }

    // Otherwise, create quiz with selected template
    try {
      setIsSubmitting(true);
      
      await api.createDashboardQuiz({
        title_ar: examName,
        title_fr: examName,
        template_id: selectedTemplate as number,
        room_id: groupId,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        is_public: false,
        settings: {
          vehicle_type: 'car',
          mode: 'exam',
          question_count: 20,
          randomize_questions: true,
          randomize_choices: true,
          passing_score: 70,
          review_allowed: false,
        },
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to assign quiz:", err);
      alert(err.message || t("groups.assignQuiz.failed", "فشل تعيين الامتحان"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 ${isRTL ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("groups.assignQuiz.title", "تعيين امتحان")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("groups.assignQuiz.subtitle", "لـ")} {groupName}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Exam Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("groups.assignQuiz.examName", "اسم الامتحان")}
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("groups.assignQuiz.examNamePlaceholder", "أدخل اسم الامتحان")}
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("groups.assignQuiz.template", "القالب")}
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value === "new" ? "new" : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingTemplates}
            >
              <option value="">
                {loadingTemplates 
                  ? t("groups.assignQuiz.loadingTemplates", "جاري التحميل...") 
                  : t("groups.assignQuiz.selectTemplate", "اختر قالباً")}
              </option>
              <option value="new">
                {t("groups.assignQuiz.createNew", "إنشاء قالب جديد")}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                  {template.isDefault ? ` • ${t("templates.default_badge", "افتراضي")}` : ""}
                  {` (${template.question_count} ${t("groups.assignQuiz.questions", "أسئلة")})`}
                </option>
              ))}
            </select>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("groups.assignQuiz.startDate", "تاريخ البداية")}
              </label>
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={isRTL ? ar : fr}
                className="border border-gray-300 rounded-lg p-2"
                modifiersClassNames={{
                  selected: "bg-blue-500 text-white hover:bg-blue-600",
                  today: "font-bold text-blue-500",
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("groups.assignQuiz.endDate", "تاريخ النهاية")}
              </label>
              <DayPicker
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                locale={isRTL ? ar : fr}
                disabled={{ before: startDate || new Date() }}
                className="border border-gray-300 rounded-lg p-2"
                modifiersClassNames={{
                  selected: "bg-blue-500 text-white hover:bg-blue-600",
                  today: "font-bold text-blue-500",
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t border-gray-200 px-6 py-4 flex gap-3 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? t("groups.assignQuiz.assigning", "جاري التعيين...")
              : selectedTemplate === "new"
              ? t("groups.assignQuiz.createTemplate", "إنشاء القالب")
              : t("groups.assignQuiz.confirm", "تأكيد")}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("groups.assignQuiz.cancel", "إلغاء")}
          </button>
        </div>
      </div>
    </div>
  );
}
