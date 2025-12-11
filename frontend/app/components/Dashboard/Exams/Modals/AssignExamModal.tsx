import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Calendar } from "~/components/ui/calendar";
import * as api from "../../../../services/api";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface AssignExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AssignExamData) => void;
}

interface AssignExamData {
  examName: string;
  groupId: string;
  startDate: Date;
  endDate: Date;
  templateId: string;
}

type Step = 1 | 2 | 3;

export default function AssignExamModal({
  isOpen,
  onClose,
  onConfirm,
}: AssignExamModalProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  // State for API data
  const [groups, setGroups] = useState<api.Room[]>([]);
  const [templates, setTemplates] = useState<api.QuizTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    try {
      setLoading(true);
      const [roomsData, templatesData] = await Promise.all([
        api.getRooms(),
        api.getQuizTemplates()
      ]);
      setGroups(roomsData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [examName, setExamName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isEditingDates, setIsEditingDates] = useState(false); // Toggle calendar view in step 2

  // Get selected group name for default exam name
  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId);
  const defaultExamName = selectedGroup
    ? `${t("assignExam.defaultName", "افتراضي")}: ${selectedGroup.name}`
    : "";

  // Format date for display (numeric format)
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy");
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from && !dateRange?.to) return "";
    const fromStr = formatDate(dateRange?.from);
    const toStr = formatDate(dateRange?.to);
    if (!fromStr && !toStr) return "";
    return isRTL 
      ? `من ${fromStr || "..."} إلى ${toStr || "..."}` 
      : `Du ${fromStr || "..."} au ${toStr || "..."}`;
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 2 && isEditingDates) {
      // If in calendar view, go back to duration display
      setIsEditingDates(false);
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
      if (currentStep === 1) {
        setIsEditingDates(false); // Reset calendar view when entering step 2
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && isEditingDates) {
      // If in calendar view, go back to duration display
      setIsEditingDates(false);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (dateRange?.from && dateRange?.to) {
      onConfirm({
        examName: examName || defaultExamName,
        groupId: selectedGroupId,
        startDate: dateRange.from,
        endDate: dateRange.to,
        templateId: selectedTemplateId,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setExamName("");
    setSelectedGroupId("");
    setDateRange({
      from: new Date(),
      to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
    setSelectedTemplateId("");
    setIsEditingDates(false);
    onClose();
  };

  const handleCreateNewTemplate = () => {
    // Save the current exam data to localStorage before navigating
    const examData = {
      examName: examName || defaultExamName,
      groupId: selectedGroupId,
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
      timestamp: Date.now(),
    };
    localStorage.setItem("pendingExamAssignment", JSON.stringify(examData));
    
    // Navigate to create template page
    navigate("/dashboard/templates/create?returnToAssign=true");
    handleClose();
  };

  // Validation
  const canProceedStep1 = selectedGroupId !== "";
  const canProceedStep2 = dateRange?.from && dateRange?.to;
  const canSubmit = selectedTemplateId !== "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {/* Header */}
        <div className="bg-primary-800 text-white p-6 rounded-t-2xl text-center">
          <h2 className="text-2xl font-bold mb-2">
            {t("assignExam.title", "تعيين امتحان")}
          </h2>
          <p className="text-primary-100 text-sm">
            {currentStep === 1 &&
              t(
                "assignExam.step1Subtitle",
                "أدخل معلومات الإمتحان وسيتم تعيين الإمتحان إلى المجموعة تلقائيا"
              )}
            {currentStep === 2 &&
              t(
                "assignExam.step2Subtitle",
                "ادخل تاريخ بداية ونهاية الإمتحان"
              )}
            {currentStep === 3 &&
              t(
                "assignExam.step3Subtitle",
                "اختر قالب أو قم بإنشاء امتحان جديد"
              )}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Exam Name & Group */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assignExam.examName", "إسم الإمتحان")}
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder={
                    defaultExamName ||
                    t("assignExam.examNamePlaceholder", "افتراضي: المجموعة 10")
                  }
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>

              {/* Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assignExam.group", "المجموعة")}
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <option value="">
                    {t("assignExam.selectGroup", "أدخل اسم المجموعة")}
                  </option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id.toString()}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Duration Display or Calendar */}
          {currentStep === 2 && !isEditingDates && (
            <div className="space-y-6">
              {/* Duration Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assignExam.duration", "المدة")}
                </label>
                <div
                  onClick={() => setIsEditingDates(true)}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-primary-400 hover:bg-gray-100 transition-colors ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      {formatDateRange()}
                    </span>
                    <img
                      src="/assets/icons/create_exam/arrow_blue_500_to_left.svg"
                      alt="edit"
                      className={`w-4 h-4 opacity-50 ${isRTL ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t(
                    "assignExam.clickToChange",
                    "انقر على المدة لتغييرها"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Calendar View */}
          {currentStep === 2 && isEditingDates && (
            <div className="space-y-4">
              {/* Selected Range Display */}
              <div
                className={`w-full px-4 py-3 border border-primary-300 rounded-xl bg-primary-50 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <span className="text-gray-700 font-medium">{formatDateRange()}</span>
              </div>

              {/* Calendar */}
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="rounded-xl border border-gray-200 p-4"
                  disabled={{ before: new Date() }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Template Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("assignExam.selectTemplate", "اختر قالب")}
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <option value="">
                    {t(
                      "assignExam.templatePlaceholder",
                      "افتراضي: قالب الامتحان الأول"
                    )}
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id.toString()}>
                      {template.title} ({template.question_count || 0}{" "}
                      {t("assignExam.questions", "سؤال")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Create New Template Link */}
              <div className="text-center">
                <button
                  onClick={handleCreateNewTemplate}
                  className="text-primary-600 hover:text-primary-800 text-sm underline transition-colors"
                >
                  {t(
                    "assignExam.noTemplates",
                    "لا يوجد قوالب مناسبة؟ إنشاء امتحان جديد"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-center gap-4 p-6 border-t border-gray-100 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          {(currentStep > 1 || (currentStep === 2 && isEditingDates)) && (
            <button
              onClick={handleBack}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t("assignExam.back", "رجوع")}
            </button>
          )}

          {currentStep < 3 || (currentStep === 2 && isEditingDates) ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !isEditingDates && !canProceedStep2) ||
                (currentStep === 2 && isEditingDates && !canProceedStep2)
              }
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 2 && isEditingDates
                ? t("assignExam.confirm", "تأكيد")
                : t("assignExam.next", "التالي")}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("assignExam.assign", "تعيين")}
            </button>
          )}

          {currentStep === 1 && (
            <button
              onClick={handleClose}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t("assignExam.cancel", "إلغاء")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
