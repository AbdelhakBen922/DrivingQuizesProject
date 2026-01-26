import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import QuestionCard from "./QuestionCard";
import QuestionEditor from "./QuestionEditor";
import TemplateQuestionsModal from "./TemplateQuestionsModal";
import { useToast, type ToastItem } from "../../../../hooks/useToast";
import ToastContainer from "../../../../components/Toast/ToastContainer";
import * as api from "../../../../services/api";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  id: string;
  type: "single" | "multiple" | "T_F";
  isRequired: boolean;
  questionText: string;
  image: string | null;
  answers: Answer[];
  points: number;
  timeLimit: number;
  randomOrder: boolean;
}

interface TemplateData {
  name: string;
  questions: QuestionData[];
}

// Default question factory - will be created with proper translations in component
const createDefaultQuestion = (t: any): QuestionData => ({
  id: `question-${Date.now()}`,
  type: "single",
  isRequired: true,
  questionText: "",
  image: null,
  answers: [
    { id: `answer-${Date.now()}-1`, text: t('createTemplate.defaultAnswers.first', 'خيار أول'), isCorrect: false },
    { id: `answer-${Date.now()}-2`, text: t('createTemplate.defaultAnswers.correct', 'الخيار الصحيح'), isCorrect: true },
    { id: `answer-${Date.now()}-3`, text: t('createTemplate.defaultAnswers.third', 'الخيار الثالث'), isCorrect: false },
    { id: `answer-${Date.now()}-4`, text: t('createTemplate.defaultAnswers.fourth', 'الخيار الرابع'), isCorrect: false },
  ],
  points: 3,
  timeLimit: 2,
  randomOrder: false,
});

// Mock initial data factory - will be created with translations
const createMockInitialQuestions = (t: any): QuestionData[] => [
  {
    id: "q1",
    type: "single",
    isRequired: true,
    questionText: t('createTemplate.suggestions.whatSign', 'إلى ماذا تشير العلامة الموجودة في الصورة'),
    image: "/assets/images/road-sign-example.jpg",
    answers: [
      { id: "a1-1", text: t('createTemplate.defaultAnswers.first', 'خيار أول'), isCorrect: false },
      { id: "a1-2", text: t('createTemplate.defaultAnswers.correct', 'الخيار الصحيح'), isCorrect: true },
      { id: "a1-3", text: t('createTemplate.defaultAnswers.third', 'الخيار الثالث'), isCorrect: false },
      { id: "a1-4", text: t('createTemplate.defaultAnswers.fourth', 'الخيار الرابع'), isCorrect: false },
    ],
    points: 3,
    timeLimit: 2,
    randomOrder: false,
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `q${i + 2}`,
    type: "single" as const,
    isRequired: true,
    questionText: t('createTemplate.suggestions.whatSign', 'إلى ماذا تشير العلامة الموجودة في الصورة').substring(0, 30) + "...",
    image: null,
    answers: [
      { id: `a${i + 2}-1`, text: t('createTemplate.defaultAnswers.first', 'خيار أول'), isCorrect: false },
      { id: `a${i + 2}-2`, text: t('createTemplate.defaultAnswers.correct', 'الخيار الصحيح'), isCorrect: true },
      { id: `a${i + 2}-3`, text: t('createTemplate.defaultAnswers.third', 'الخيار الثالث'), isCorrect: false },
      { id: `a${i + 2}-4`, text: t('createTemplate.defaultAnswers.fourth', 'الخيار الرابع'), isCorrect: false },
    ],
    points: 2,
    timeLimit: 2,
    randomOrder: false,
  })),
];

export default function CreateTemplatePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";
  const [searchParams] = useSearchParams();

  // Check if editing existing template or returning to assignment workflow
  const editTemplateId = searchParams.get("edit");
  const duplicateTemplateId = searchParams.get("duplicate");
  const returnToAssign = searchParams.get("returnToAssign") === "true";

  // Toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { success, error, info, removeToast } = useToast({ toasts, setToasts });

  // State
  const [templateName, setTemplateName] = useState(t('createTemplate.defaultProjectName', '[إسم المشروع]'));
  const [questions, setQuestions] = useState<QuestionData[]>(() => createMockInitialQuestions(t));
  const [activeQuestionId, setActiveQuestionId] = useState<string>(questions[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  // Load template when editing or duplicating
  useEffect(() => {
    if (editTemplateId) {
      loadTemplate(parseInt(editTemplateId), false);
    } else if (duplicateTemplateId) {
      loadTemplate(parseInt(duplicateTemplateId), true);
    }
  }, [editTemplateId, duplicateTemplateId]);

  const loadTemplate = async (templateId: number, isDuplicate: boolean = false) => {
    try {
      setIsLoadingTemplate(true);
      console.log('Loading template:', templateId, 'isDuplicate:', isDuplicate);
      const template = await api.getQuizTemplate(templateId);
      console.log('Loaded template data:', template);
      
      // Set template name (add copy suffix if duplicating)
      const namePrefix = isDuplicate ? t('createTemplate.copyOf', 'نسخة من') + ' ' : '';
      setTemplateName(namePrefix + (template.title || t('createTemplate.defaultProjectName', '[إسم المشروع]')));
      
      // Get questions from either 'questions' or 'template_questions' field
      const templateQuestions = template.questions || (template as any).template_questions || [];
      console.log('Template questions array:', templateQuestions);
      
      // Convert API template questions to QuestionData format
      const loadedQuestions: QuestionData[] = templateQuestions.map((tq: any, index: number) => {
        // Convert relative image paths to absolute URLs
        let imageUrl = tq.question.image_url || null;
        if (imageUrl && !imageUrl.startsWith('http')) {
          // If it's a relative path, prepend the backend URL (remove /api suffix for static files)
          const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
          imageUrl = `${baseUrl}/${imageUrl}`;
        }
        
        return {
          id: tq.question_id.toString(),
          type: tq.question.type === 'single_choice' ? 'single' : 'multiple',
          isRequired: tq.is_required,
          questionText: tq.question.text_ar || tq.question.text_fr || '',
          image: imageUrl,
          answers: tq.question.choices.map((c) => ({
            id: `answer-${c.id}`,
            text: c.text_ar || c.text_fr || '',
            isCorrect: c.is_correct
          })),
          points: tq.question.score || 3,
          timeLimit: (tq.duration_sec || 120) / 60,
          randomOrder: tq.randomize_options || false,
        };
      });
      
      console.log('Converted questions:', loadedQuestions);
      
      if (loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
        setActiveQuestionId(loadedQuestions[0].id);
      }
      
      const message = isDuplicate 
        ? t("createTemplate.templateDuplicated", "تم تحميل القالب للتكرار")
        : t("createTemplate.templateLoaded", "تم تحميل القالب");
      info(message);
    } catch (err: any) {
      console.error('Error loading template:', err);
      console.error('Error stack:', err.stack);
      error(err.message || t("createTemplate.loadFailed", "فشل تحميل القالب"));
      navigate('/dashboard/templates');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  // Check for pending exam assignment on mount
  useEffect(() => {
    if (returnToAssign) {
      const pendingAssignment = localStorage.getItem("pendingExamAssignment");
      if (pendingAssignment) {
        info(t("createTemplate.resumingAssignment", "سيتم استكمال تعيين الاختبار بعد النشر"));
      }
    }
  }, [returnToAssign, t]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);

  // Load available templates for duplication
  const loadAvailableTemplates = async () => {
    try {
      const templates = await api.listQuizTemplates();
      setAvailableTemplates(templates);
    } catch (err) {
      console.error('Error loading templates:', err);
      error(t("createTemplate.loadTemplatesFailed", "فشل تحميل القوالب"));
    }
  };

  // Handler for opening duplicate modal
  const handleOpenDuplicateModal = async () => {
    setIsDuplicateModalOpen(true);
    await loadAvailableTemplates();
  };

  // Handler for selecting template to duplicate
  const handleSelectTemplateToDuplicate = (templateId: number) => {
    setIsDuplicateModalOpen(false);
    navigate(`/dashboard/templates/create?duplicate=${templateId}`);
  };

  // Handlers
  const handleUpdateQuestion = (updatedQuestion: QuestionData) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const handleAddQuestion = () => {
    const newQuestion = createDefaultQuestion(t);
    setQuestions((prev) => [...prev, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      error(t("createTemplate.cannotDeleteLast", "لا يمكن حذف السؤال الأخير"));
      return;
    }
    
    const newQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(newQuestions);
    
    if (activeQuestionId === questionId) {
      setActiveQuestionId(newQuestions[0]?.id || "");
    }
    
    success(t("createTemplate.questionDeleted", "تم حذف السؤال بنجاح"));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setLastSaved(new Date());
    success(t("createTemplate.saved", "تم الحفظ بنجاح"));
  };

  const handlePublish = async () => {
    // Validate
    const emptyQuestions = questions.filter((q) => !q.questionText.trim());
    if (emptyQuestions.length > 0) {
      error(t("createTemplate.emptyQuestions", "يوجد أسئلة فارغة"));
      return;
    }

    const noCorrectAnswer = questions.filter(
      (q) => !q.answers.some((a) => a.isCorrect)
    );
    if (noCorrectAnswer.length > 0) {
      error(t("createTemplate.noCorrectAnswer", "يوجد أسئلة بدون إجابة صحيحة"));
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Convert questions to API format
      // Always create new question objects with updated data
      const apiQuestions: api.QuizTemplateQuestionInput[] = questions.map((q, index) => ({
        question: {
          text_ar: q.questionText,
          text_fr: q.questionText,
          image_url: q.image,
          category: 'rule',
          type: q.type === 'T_F' ? 'single_choice' : (q.type === 'multiple' ? 'multiple_choice' : 'single_choice'),
          difficulty: 'medium',
          score: q.points,
          choices: q.answers.map((a, idx) => ({
            text_ar: a.text,
            text_fr: a.text,
            is_correct: a.isCorrect,
            position: idx,
          })),
        },
        position: index,
        duration_sec: q.timeLimit * 60,
        is_required: q.isRequired,
        randomize_options: q.randomOrder,
      }));

      // Create or update the template via API
      let newTemplate;
      if (editTemplateId) {
        // Update existing template
        console.log('Updating template:', editTemplateId, {
          title: templateName,
          description: `Template with ${questions.length} questions`,
          difficulty: 'medium',
          questions: apiQuestions,
        });
        newTemplate = await api.updateQuizTemplate(parseInt(editTemplateId), {
          title: templateName,
          description: `Template with ${questions.length} questions`,
          difficulty: 'medium',
          questions: apiQuestions,
        });
        console.log('Template updated successfully:', newTemplate);
        success(t("createTemplate.updated", "تم تحديث القالب بنجاح"));
      } else {
        // Create new template
        console.log('Creating new template:', {
          title: templateName,
          description: `Template with ${questions.length} questions`,
          difficulty: 'medium',
          questions: apiQuestions,
        });
        newTemplate = await api.createQuizTemplate({
          title: templateName,
          description: `Template with ${questions.length} questions`,
          difficulty: 'medium',
          questions: apiQuestions,
        });
        console.log('Template created successfully:', newTemplate);
        success(t("createTemplate.published", "تم نشر القالب بنجاح"));
      }

      setIsSaving(false);

      // Check if we need to create an exam from this template
      if (returnToAssign) {
        const pendingAssignmentStr = localStorage.getItem("pendingExamAssignment");
        
        if (pendingAssignmentStr) {
          try {
            const pendingAssignment = JSON.parse(pendingAssignmentStr);
            
            // Create the exam with the new template
            await api.createDashboardQuiz({
              title_ar: pendingAssignment.examName,
              title_fr: pendingAssignment.examName,
              template_id: newTemplate.id,
              room_id: parseInt(pendingAssignment.groupId),
              starts_at: pendingAssignment.startDate,
              ends_at: pendingAssignment.endDate,
              is_public: false,
              settings: {
                vehicle_type: 'car',
                mode: 'exam',
                question_count: questions.length,
                randomize_questions: true,
                randomize_choices: true,
                passing_score: 70,
                review_allowed: false,
              },
            });

            // Clear the pending assignment
            localStorage.removeItem("pendingExamAssignment");
            
            success(t("createTemplate.examAssigned", "تم تعيين الاختبار بنجاح"));
            
            // Navigate back to exams page
            navigate("/dashboard/quizzes");
            return;
          } catch (err) {
            console.error("Error creating exam from template:", err);
            error(t("createTemplate.examAssignmentFailed", "فشل تعيين الاختبار"));
          }
        }
      }

      // Normal flow - navigate to templates page
      // Add timestamp to force fresh navigation and prevent caching
      setTimeout(() => {
        navigate("/dashboard/templates", { replace: true });
      }, 100);
    } catch (err: any) {
      console.error('Error publishing/updating template:', err);
      setIsSaving(false);
      const errorMessage = err.message || err.detail || t("createTemplate.publishFailed", "فشل نشر القالب");
      error(errorMessage);
      
      // Log detailed error for debugging
      if (err.response) {
        console.error('Response error:', err.response);
      }
    }
  };

  const handlePreview = () => {
    // TODO: Open preview modal
    info(t("createTemplate.previewNotAvailable", "المعاينة غير متاحة حالياً"));
  };

  const handleAddFromTemplates = () => {
    setIsTemplateModalOpen(true);
  };

  const handleSelectTemplateQuestions = (templateQuestions: any[]) => {
    // Convert template questions to QuestionData format and add them
    const newQuestions = templateQuestions.map(tq => ({
      ...tq,
      id: `question-${Date.now()}-${Math.random()}`,
    }));
    setQuestions((prev) => [...prev, ...newQuestions]);
    success(t("createTemplate.questionsAdded", `تم إضافة ${newQuestions.length} أسئلة`));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return t("createTemplate.justNow");
    if (diff < 3600) return t("createTemplate.minutesAgo", { minutes: Math.floor(diff / 60) });
    return t("createTemplate.hoursAgo", { hours: Math.floor(diff / 3600) });
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Loading State */}
      {isLoadingTemplate && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 text-lg">{t("createTemplate.loadingTemplate", "جاري تحميل القالب...")}</p>
          </div>
        </div>
      )}
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className={`flex items-center justify-between max-w-7xl mx-auto ${isRTL ? "flex-row" : "flex-row"}`}>
          {/* Left Side: Back Button & Last Saved */}
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row" : "flex-row"}`}>
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src="/assets/icons/create_exam/arrow_blue_500_to_left.svg"
                alt="back"
                className={`w-5 h-5 ${isRTL ?  "rotate-180": ""}`}
              />
            </button>
            <span className="text-sm text-gray-500">{formatLastSaved()}</span>
          </div>

          {/* Center: Template Name */}
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : "flex-row"}`}>
            <img
              src="/assets/icons/create_exam/Cloud_Check.svg"
              alt="saved"
              className="w-5 h-5 text-green"
            />
            {isEditingName ? (
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                autoFocus
                className={`text-lg font-semibold text-primary-800 bg-transparent border-b-2 border-primary-500 outline-none px-2 ${isRTL ? "text-right" : "text-left"}`}
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-lg font-semibold text-primary-800 hover:text-primary-600"
              >
                {templateName}
              </button>
            )}
          </div>

          {/* Right Side: Actions */}
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : "flex-row"}`}>
            {!editTemplateId && !duplicateTemplateId && (
              <button
                onClick={handleOpenDuplicateModal}
                className={`
                  flex items-center gap-2 px-4 py-2 border border-primary-500 text-primary-600 rounded-xl
                  hover:bg-primary-50 transition-colors text-sm font-medium
                  ${isRTL ? "flex-row-reverse" : "flex-row"}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t("createTemplate.createFromExisting", "إنشاء من قالب موجود")}
              </button>
            )}
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src="/assets/icons/create_exam/Settings.svg"
                alt="settings"
                className="w-5 h-5"
              />
            </button>
            <button
              onClick={handlePreview}
              className={`
                flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl
                hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700
                ${isRTL ? "flex-row-reverse" : "flex-row-reverse"}              `}
            >
              <img
                src="/assets/icons/create_exam/play.svg"
                alt="preview"
                className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`}
              />
              {t("createTemplate.preview", "المعاينة")}
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className={`
                px-6 py-2 bg-primary-500 text-white rounded-xl font-medium text-sm
                hover:bg-primary-600 transition-colors disabled:opacity-50
              `}
            >
              {isSaving 
                ? t("createTemplate.saving", "جاري الحفظ...") 
                : t("createTemplate.publish", "النشر")
              }
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex max-w-7xl mx-auto ${isRTL ? "flex-row-reverse" : "flex-row-reverse"}`}>
        {/* Question Editor Area */}
        <div className="flex-1 p-6">
          {/* Section Header */}
          <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row" : "flex-row"}`}>
            <h2 className="text-xl font-bold text-primary-800">
              {t("createTemplate.editQuestion", "تعديل السؤال")}
            </h2>
            <button
              onClick={handleAddFromTemplates}
              className={`
                flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700
                ${isRTL ? "flex-row" : "flex-row"}
              `}
            >
              {t("createTemplate.addFromTemplates", "إضافة سؤال من القوالب")}
              <img
                src="/assets/icons/create_exam/arrow_blue_500_to_left.svg"
                alt="arrow"
                className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`}
              />
            </button>
          </div>

          {/* Question Editor */}
          {activeQuestion && (
            <QuestionEditor
              question={activeQuestion}
              questionNumber={questions.findIndex((q) => q.id === activeQuestionId) + 1}
              onUpdate={handleUpdateQuestion}
              onAddFromTemplates={handleAddFromTemplates}
            />
          )}
        </div>

        {/* Questions Sidebar */}
        <div className={`w-80 bg-white border-${isRTL ? "r" : "l"} border-gray-200 p-4 min-h-[calc(100vh-65px)]`}>
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row" : "flex-row"}`}>
            <h3 className="text-sm font-semibold text-gray-700">
              {t("createTemplate.questions", "الأسئلة")} ({questions.length})
            </h3>
            <button
              onClick={handleAddQuestion}
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <img
                src="/assets/icons/create_exam/plus.svg"
                alt="add"
                className="w-4 h-4 brightness-0 invert"
              />
            </button>
          </div>

          {/* Questions List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[calc(100vh-150px)] overflow-y-auto">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    id={question.id}
                    index={index + 1}
                    title={question.questionText || t("createTemplate.untitledQuestion", "سؤال بدون عنوان")}
                    type={question.type}
                    isActive={question.id === activeQuestionId}
                    onClick={() => setActiveQuestionId(question.id)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Template Questions Modal */}
      <TemplateQuestionsModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectQuestions={handleSelectTemplateQuestions}
      />

      {/* Duplicate Template Modal */}
      {isDuplicateModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsDuplicateModalOpen(false)}
        >
          <div className={`bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${isRTL ? "text-right" : "text-left"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
              <h2 className="text-2xl font-bold text-primary-800">
                {t("createTemplate.selectTemplateToClone", "اختر قالبًا للنسخ")}
              </h2>
              <button
                onClick={() => setIsDuplicateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {availableTemplates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t("createTemplate.noTemplatesAvailable", "لا توجد قوالب متاحة")}
                </p>
              ) : (
                availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplateToDuplicate(template.id)}
                    className={`
                      w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 
                      hover:bg-primary-50 transition-all text-left
                      ${isRTL ? "text-right" : "text-left"}
                    `}
                  >
                    <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {template.question_count} {t("createTemplate.questions", "أسئلة")} • {template.difficulty}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
