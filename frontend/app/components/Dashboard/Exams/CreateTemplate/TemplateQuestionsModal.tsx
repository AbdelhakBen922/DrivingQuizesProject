import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  getTemplates, 
  MOCK_QUESTIONS,
  type Question as MockQuestion 
} from "../../../../data/mockData";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface TemplateQuestion {
  id: string;
  type: "single" | "multiple" | "T_F";
  isRequired: boolean;
  questionText: string;
  image: string | null;
  answers: Answer[];
  points: number;
  timeLimit: number;
  randomOrder: boolean;
  templateName: string;
}

interface TemplateQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestions: (questions: TemplateQuestion[]) => void;
}

export default function TemplateQuestionsModal({
  isOpen,
  onClose,
  onSelectQuestions,
}: TemplateQuestionsModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  // Load questions from centralized mock data and expand them
  const templates = useMemo(() => getTemplates(), []);
  
  const questions: TemplateQuestion[] = useMemo(() => {
    // Generate questions for each template based on their questionsCount
    const allQuestions: TemplateQuestion[] = [];
    
    templates.forEach((template) => {
      // For each template, generate questions based on questionsCount
      for (let i = 0; i < Math.min(template.questionsCount, 10); i++) {
        // Use existing mock questions as base and cycle through them
        const baseQuestion = MOCK_QUESTIONS[i % MOCK_QUESTIONS.length];
        
        allQuestions.push({
          id: `${template.id}-q-${i}`,
          type: baseQuestion.type,
          isRequired: true,
          questionText: i < MOCK_QUESTIONS.length 
            ? baseQuestion.questionText 
            : `${template.name} - ${t('createTemplate.question', 'سؤال')} ${i + 1}`,
          image: baseQuestion.image,
          answers: baseQuestion.answers.map((a, idx) => ({
            id: `${template.id}-q-${i}-a-${idx}`,
            text: a.text,
            isCorrect: a.isCorrect,
          })),
          points: baseQuestion.points,
          timeLimit: baseQuestion.timeLimit / 60, // Convert to minutes
          randomOrder: Math.random() > 0.5,
          templateName: template.name,
        });
      }
    });
    
    return allQuestions;
  }, [templates, t]);
  
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "single" | "multiple" | "T_F">("all");

  useEffect(() => {
    if (isOpen) {
      setSelectedQuestions(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || q.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleAddSelected = () => {
    const questionsToAdd = questions.filter(q => selectedQuestions.has(q.id));
    onSelectQuestions(questionsToAdd);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "single":
        return t("createTemplate.questionTypes.single", "وحيد الإختيار");
      case "multiple":
        return t("createTemplate.questionTypes.multiple", "متعدد الإختيارات");
      case "T_F":
        return t("createTemplate.trueFalse", "صح/خطأ");
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col ${isRTL ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}>
          <h2 className="text-2xl font-bold text-primary-800">
            {t("createTemplate.addFromTemplates", "إضافة من القوالب")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src="/assets/icons/create_exam/Close.svg" alt="close" className="w-6 h-6" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className={`p-6 border-b border-gray-200 space-y-4`}>
          {/* Search */}
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("createTemplate.searchQuestions", "ابحث عن سؤال...")}
                className={`
                  w-full px-4 py-2 border border-gray-300 rounded-xl outline-none
                  focus:border-primary-500 transition-colors
                  ${isRTL ? "pr-12 text-right" : "pl-12"}
                `}
              />
              <img
                src="/assets/icons/create_exam/Search.svg"
                alt="search"
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 opacity-50 ${isRTL ? "right-4" : "left-4"}`}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm text-gray-600 font-medium">
              {t("createTemplate.questionType", "نوع السؤال")}:
            </span>
            <div className="flex gap-2">
              {(["all", "single", "multiple", "T_F"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`
                    px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${filterType === type
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {type === "all" 
                    ? t("createTemplate.all", "الكل")
                    : getTypeLabel(type)
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Select All */}
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={handleSelectAll}
              className={`flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-400"
                  }
                `}
              >
                {selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0 && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {t("createTemplate.selectAll", "تحديد الكل")} ({selectedQuestions.size}/{filteredQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              onClick={() => handleToggleQuestion(question.id)}
              className={`
                flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedQuestions.has(question.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 bg-white"
                }
                ${isRTL ? "flex-row-reverse" : ""}
              `}
            >
              {/* Checkbox */}
              <div
                className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all mt-1
                  ${selectedQuestions.has(question.id)
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-400"
                  }
                `}
              >
                {selectedQuestions.has(question.id) && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-sm font-semibold text-primary-800">
                    {question.questionText}
                  </span>
                </div>
                
                <div className={`flex items-center gap-4 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-lg">
                    {getTypeLabel(question.type)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {question.templateName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {question.points} {t("createTemplate.points", "نقاط")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {question.timeLimit} {t("createTemplate.minutes", "دقيقة")}
                  </span>
                  {question.image && (
                    <span className="text-xs text-gray-500">
                      📷 {t("createTemplate.hasImage", "صورة")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("createTemplate.cancel", "إلغاء")}
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedQuestions.size === 0}
            className={`
              px-6 py-2 bg-primary-500 text-white rounded-xl font-medium
              hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {t("createTemplate.addQuestions", "إضافة الأسئلة")} ({selectedQuestions.size})
          </button>
        </div>
      </div>
    </div>
  );
}
