import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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
import AnswerOption from "./AnswerOption";

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

interface QuestionEditorProps {
    question: QuestionData;
    questionNumber: number;
    onUpdate: (question: QuestionData) => void;
    onAddFromTemplates: () => void;
}

export default function QuestionEditor({
    question,
    questionNumber,
    onUpdate,
    onAddFromTemplates,
}: QuestionEditorProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showImageZoom, setShowImageZoom] = useState(false);

    // Drag and drop sensors for answers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Quick suggestions for question text
    const quickSuggestions = [
        t("createTemplate.suggestions.whatSign", "إلى ماذا تشير العلامة الموجودة في الصورة"),
        t("createTemplate.suggestions.priority", "اختر ترتيب الأولوية الصحيح"),
        t("createTemplate.suggestions.whatToDo", "ماذا يجب أن تفعل في هذه الحالة"),
    ];

    const handleTypeChange = (type: "single" | "multiple" | "T_F") => {
        if (type === "T_F") {
            // For True/False, reset to exactly 2 answers
            const trueFalseAnswers: Answer[] = [
                { 
                    id: `answer-true-${Date.now()}`, 
                    text: t('createTemplate.trueAnswer', isRTL ? 'صحيح' : 'True'), 
                    isCorrect: true 
                },
                { 
                    id: `answer-false-${Date.now()}`, 
                    text: t('createTemplate.falseAnswer', isRTL ? 'خطأ' : 'False'), 
                    isCorrect: false 
                },
            ];
            onUpdate({ ...question, type, answers: trueFalseAnswers });
        } else {
            onUpdate({ ...question, type });
        }
    };

    const handleRequiredChange = () => {
        onUpdate({ ...question, isRequired: !question.isRequired });
    };

    const handleQuestionTextChange = (text: string) => {
        onUpdate({ ...question, questionText: text });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onUpdate({ ...question, image: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        onUpdate({ ...question, image: null });
    };

    const handleAnswerTextChange = (answerId: string, text: string) => {
        const updatedAnswers = question.answers.map((a) =>
            a.id === answerId ? { ...a, text } : a
        );
        onUpdate({ ...question, answers: updatedAnswers });
    };

    const handleAnswerCorrectChange = (answerId: string) => {
        const updatedAnswers = question.answers.map((a) => ({
            ...a,
            isCorrect: question.type === "single" || question.type === "T_F"
                ? a.id === answerId
                : a.id === answerId ? !a.isCorrect : a.isCorrect,
        }));
        onUpdate({ ...question, answers: updatedAnswers });
    };

    const handleDeleteAnswer = (answerId: string) => {
        if (question.answers.length <= 2) return;
        const updatedAnswers = question.answers.filter((a) => a.id !== answerId);
        onUpdate({ ...question, answers: updatedAnswers });
    };

    const handleAddAnswer = () => {
        const newAnswer: Answer = {
            id: `answer-${Date.now()}`,
            text: "",
            isCorrect: false,
        };
        onUpdate({ ...question, answers: [...question.answers, newAnswer] });
    };

    const handlePointsChange = (points: number) => {
        onUpdate({ ...question, points: Math.max(1, Math.min(10, points)) });
    };

    const handleTimeLimitChange = (timeLimit: number) => {
        onUpdate({ ...question, timeLimit: Math.max(1, Math.min(60, timeLimit)) });
    };

    const handleRandomOrderChange = () => {
        onUpdate({ ...question, randomOrder: !question.randomOrder });
    };

    const handleAnswerDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = question.answers.findIndex((a) => a.id === active.id);
            const newIndex = question.answers.findIndex((a) => a.id === over.id);
            const reorderedAnswers = arrayMove(question.answers, oldIndex, newIndex);
            onUpdate({ ...question, answers: reorderedAnswers });
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Header Row */}
            <div className={`flex items-center justify-between mb-6 flex-row-reverse`}>
                {/* Left: More options and Required toggle */}
                <div className={`flex items-center gap-4 flex-row-reverse`}>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <img
                            src="/assets/icons/create_exam/ellipsis-h.svg"
                            alt="options"
                            className="w-5 h-5"
                        />
                    </button>

                    {/* Required Toggle */}
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-sm text-gray-600">
                            {t("createTemplate.required", "إجباري")}
                        </span>
                        <button
                            onClick={handleRequiredChange}
                            className={`
                w-12 h-6 rounded-full transition-colors relative
                ${question.isRequired ? "bg-green" : "bg-gray-300"}
              `}
                        >
                            <div
                                className={`
                  w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all
                  ${question.isRequired
                                        ? (isRTL ? "left-0.5" : "right-0.5")
                                        : (isRTL ? "right-0.5" : "left-0.5")
                                    }
                `}
                            />
                        </button>
                    </div>
                </div>

                {/* Right: Question Type Selector */}
                <div className={`flex items-center gap-2 bg-gray-100 rounded-xl p-1 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                    <button
                        onClick={() => handleTypeChange("single")}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
              ${question.type === "single"
                                ? "bg-white shadow text-primary-800"
                                : "text-gray-500 hover:text-gray-700"
                            }
              ${isRTL ? "flex-row" : "flex-row-reverse"}
            `}
                    >
                        <img
                            src="/assets/icons/create_exam/radio_button_checked_dark_blue.svg"
                            alt="single"
                            className="w-4 h-4"
                        />
                        {t("createTemplate.singleChoice", "وحيد الإختيار")}
                    </button>
                    <button
                        onClick={() => handleTypeChange("multiple")}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
              ${question.type === "multiple"
                                ? "bg-white shadow text-primary-800"
                                : "text-gray-500 hover:text-gray-700"
                            }
              ${isRTL ? "flex-row" : "flex-row-reverse"}
            `}
                    >
                        <img
                            src="/assets/icons/create_exam/check-circle.svg"
                            alt="multiple"
                            className="w-4 h-4"
                        />
                        {t("createTemplate.multipleChoice", "متعدد الإختيارات")}
                    </button>
                    <button
                        onClick={() => handleTypeChange("T_F")}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
              ${question.type === "T_F"
                                ? "bg-white shadow text-primary-800"
                                : "text-gray-500 hover:text-gray-700"
                            }
              ${isRTL ? "flex-row" : "flex-row-reverse"}
            `}
                    >
                        <span className="text-lg font-bold">{isRTL ? "خ/ص" : "T/F"}</span>
                        {t("createTemplate.trueFalse", "صح/خطأ")}
                    </button>
                </div>
            </div>

            {/* Question Title */}
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                <span className="text-primary-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">?</text>
                    </svg>
                </span>
                <h3 className="text-lg font-semibold text-primary-800">
                    {t("createTemplate.questionLabel", "السؤال")} {questionNumber === 1 ? t("createTemplate.first", "الأول") : questionNumber}
                </h3>
                <span className="text-red">*</span>
            </div>

            {/* Question Content Area */}
            <div className={`flex gap-6 mb-6 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                {/* Image Upload Area */}
                <div className="w-48 flex-shrink-0">
                    {question.image ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                            <img
                                src={question.image}
                                alt="question"
                                className="w-full h-40 object-cover"
                            />
                            <div className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} flex gap-1`}>
                                <button
                                    onClick={() => setShowImageZoom(true)}
                                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow"
                                >
                                    <img
                                        src="/assets/icons/create_exam/zoom_in_24px.svg"
                                        alt="zoom"
                                        className="w-4 h-4"
                                    />
                                </button>
                                <button
                                    onClick={handleRemoveImage}
                                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow"
                                >
                                    <img
                                        src="/assets/icons/create_exam/Trash_Full.svg"
                                        alt="delete"
                                        className="w-4 h-4"
                                    />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-colors"
                        >
                            <img
                                src="/assets/icons/create_exam/plus.svg"
                                alt="add"
                                className="w-8 h-8 opacity-50"
                            />
                            <span className="text-sm text-gray-500">
                                {t("createTemplate.addImage", "إضافة صورة")}
                            </span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>

                {/* Question Text Area */}
                <div className="flex-1">
                    <textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionTextChange(e.target.value)}
                        placeholder={t("createTemplate.questionPlaceholder", "اكتب نص السؤال هنا...")}
                        className={`
              w-full h-32 p-4 border border-gray-200 rounded-xl resize-none
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${isRTL ? "text-right" : "text-left"}
            `}
                    />

                    {/* Quick Suggestions */}
                    <div className="mt-3">
                        <p className={`text-sm text-gray-500 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                            {t("createTemplate.quickSuggestions", "اقتراحات سريعة")}
                        </p>
                        <div className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}>
                            {quickSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuestionTextChange(suggestion)}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-primary-100 hover:text-primary-700 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers Section */}
            <div className="mb-6">
                <h4 className={`text-sm font-semibold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                    {t("createTemplate.options", "الخيارات")}
                </h4>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleAnswerDragEnd}
                >
                    <SortableContext
                        items={question.answers.map(a => a.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {question.answers.map((answer, idx) => (
                                <AnswerOption
                                    key={answer.id}
                                    id={answer.id}
                                    text={answer.text}
                                    isCorrect={answer.isCorrect}
                                    isMultiple={question.type === "multiple"}
                                    isTrueFalse={question.type === "T_F"}
                                    onTextChange={(text) => handleAnswerTextChange(answer.id, text)}
                                    onCorrectChange={() => handleAnswerCorrectChange(answer.id)}
                                    onDelete={() => handleDeleteAnswer(answer.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Add Option Button - Hidden for T_F */}
                {question.type !== "T_F" && (
                    <button
                        onClick={handleAddAnswer}
                        className={`
            flex items-center gap-2 mt-3 px-4 py-2 text-sm text-primary-600 
            hover:bg-primary-50 rounded-lg transition-colors
            ${isRTL ? "flex-row-reverse mr-auto" : "ml-auto"}
          `}
                    >
                        <img
                            src="/assets/icons/create_exam/plus.svg"
                            alt="add"
                            className="w-4 h-4"
                        />
                        {t("createTemplate.addOption", "إضافة خيار")}
                    </button>
                )}
            </div>

            {/* Bottom Settings */}
            <div className={`flex items-center justify-between pt-4 border-t border-gray-200 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                {/* Points */}
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="text-sm text-gray-600">
                        {t("createTemplate.points", "عدد النقاط")}
                    </span>
                    <div className={`flex items-center gap-1 bg-yellow/10 rounded-lg px-3 py-1 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                        <img
                            src="/assets/icons/create_exam/Star.svg"
                            alt="points"
                            className="w-5 h-5"
                        />
                        <input
                            type="number"
                            value={question.points}
                            onChange={(e) => handlePointsChange(parseInt(e.target.value) || 1)}
                            min={1}
                            max={10}
                            className={`w-12 bg-transparent text-center font-semibold text-yellow outline-none ${isRTL ? "text-right" : "text-left"}`}
                        />
                    </div>
                </div>

                {/* Time Limit */}
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="text-sm text-gray-600">
                        {t("createTemplate.timeLimit", "الوقت المقدر")}
                    </span>
                    <div className={`flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                        <img
                            src="/assets/icons/create_exam/Timer.svg"
                            alt="timer"
                            className="w-5 h-5"
                        />
                        <input
                            type="number"
                            value={question.timeLimit}
                            onChange={(e) => handleTimeLimitChange(parseInt(e.target.value) || 1)}
                            min={1}
                            max={60}
                            className={`w-12 bg-transparent text-center font-semibold text-gray-700 outline-none ${isRTL ? "text-right" : "text-left"}`}
                        />
                        <span className="text-sm text-gray-500">
                            {t("createTemplate.minutes", "دقيقة")}
                        </span>
                    </div>
                </div>

                {/* Random Order Toggle */}
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="text-sm text-gray-600">
                        {t("createTemplate.randomOrder", "ترتيب عشوائي")}
                    </span>
                    <button
                        onClick={handleRandomOrderChange}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${question.randomOrder
                                ? "bg-primary-100 text-primary-700"
                                : "bg-gray-100 text-gray-600"
                            }
            `}
                    >
                        {question.randomOrder
                            ? t("createTemplate.randomEnabled", "مفعّل")
                            : t("createTemplate.keepOrder", "الإحتفاظ بالترتيب الحالي")
                        }
                    </button>
                </div>
            </div>

            {/* Image Zoom Modal */}
            {showImageZoom && question.image && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageZoom(false)}
                >
                    <img
                        src={question.image}
                        alt="zoomed"
                        className="max-w-full max-h-full rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
