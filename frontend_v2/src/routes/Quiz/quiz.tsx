import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RadioForm from "../../components/ui/RadioForm";
import NavBar from "~/components/NavBar";
import QuizProgressBar from "~/components/Quiz/QuizProgressBar";
import QuizTimer from "~/components/Quiz/QuizTimer";
import * as api from "~/services/api";
import { useAuth } from "~/contexts/AuthContext";
import { ProtectedRoute } from "~/components/ProtectedRoute";

interface Choice {
    id: number;
    text: string;
    position: number;
}

interface Question {
    id: number;
    text: string;
    image_url: string | null;
    choices: Choice[];
    answered_choice_id: number | null;
    duration_sec: number | null;
}

interface QuizData {
    attempt_id: number;
    quiz_id: number;
    quiz_title: string;
    attempt_number: number;
    total_questions: number;
    questions: Question[];
}

interface QuizResults {
    attempt_id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    percentage: number;
    passed: boolean;
}

const Quiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<QuizResults | null>(null);
    const [answerFeedback, setAnswerFeedback] = useState<{[key: number]: boolean}>({});

    useEffect(() => {
        if (!quizId) {
            navigate("/student/dashboard");
            return;
        }
        startQuiz();
    }, [quizId]);

    const startQuiz = async () => {
        try {
            setLoading(true);
            const lang = i18n.language?.startsWith("ar") ? "ar" : "fr";
            const data = await api.startQuiz(parseInt(quizId!), lang);
            setQuizData(data);
            
            // Load saved answer for first question
            if (data.questions[0]?.answered_choice_id) {
                setSelectedOption(`option${data.questions[0].answered_choice_id}`);
            }
        } catch (err: any) {
            console.error("Failed to start quiz:", err);
            setError(err.message || "Failed to start quiz");
        } finally {
            setLoading(false);
        }
    };

    const selectOption = async (value: string) => {
        setSelectedOption(value);
        setIsConfirmed(false);
    };

    const handleConfirm = async () => {
        if (!quizData || !selectedOption) return;

        const currentQuestion = quizData.questions[currentQuestionIndex];
        const choiceId = parseInt(selectedOption.replace("option", ""));

        try {
            const response = await api.submitQuizAnswer(parseInt(quizId!), {
                question_id: currentQuestion.id,
                choice_id: choiceId,
            });
            setIsConfirmed(true);
            // Store answer feedback
            setAnswerFeedback(prev => ({
                ...prev,
                [currentQuestion.id]: response.is_correct
            }));
        } catch (err) {
            console.error("Failed to save answer:", err);
        }
    };

    const handleTimeExpired = () => {
        // Auto-advance to next question when time expires
        if (isConfirmed) {
            handleNext();
        } else {
            // If not confirmed, skip without saving
            handleNext();
        }
    };

    const handleNext = () => {
        if (!quizData) return;

        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsConfirmed(false);
            
            // Load saved answer for next question
            const nextQuestion = quizData.questions[currentQuestionIndex + 1];
            if (nextQuestion?.answered_choice_id) {
                setSelectedOption(`option${nextQuestion.answered_choice_id}`);
            } else {
                setSelectedOption("");
            }
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        if (!quizData) return;

        try {
            const resultsData = await api.finishQuiz(parseInt(quizId!));
            setResults(resultsData);
            setShowResults(true);
            // Navigate to review page with attempt_id
            navigate(`/quiz/${quizId}/review/${resultsData.attempt_id}`);
        } catch (err: any) {
            console.error("Failed to finish quiz:", err);
            setError(err.message || "Failed to submit quiz");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">{t("common.loading", "Loading...")}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => navigate("/student/dashboard")} className="btn-primary">
                        {t("common.backToDashboard", "Retour au tableau de bord")}
                    </button>
                </div>
            </div>
        );
    }

    if (showResults && results) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h1 className={`text-3xl font-bold mb-2 ${results.passed ? "text-green-600" : "text-red-600"}`}>
                                {results.passed ? t("quiz.passed", "Réussi!") : t("quiz.failed", "Échoué")}
                            </h1>
                            <p className="text-gray-600">{quizData?.quiz_title}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <p className="text-blue-600 text-sm mb-1">{t("quiz.score", "Score")}</p>
                                <p className="text-3xl font-bold text-blue-800">{results.percentage}%</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <p className="text-green-600 text-sm mb-1">{t("quiz.correct", "Réponses correctes")}</p>
                                <p className="text-3xl font-bold text-green-800">
                                    {results.correct_answers}/{results.total_questions}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/student/dashboard")}
                            className="w-full btn-primary"
                        >
                            {t("common.backToDashboard", "Retour au tableau de bord")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!quizData) return null;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const question = currentQuestion.text;
    const totalQuestions = quizData.total_questions;

    // Check if current question has been answered and get feedback
    const currentAnswerIsCorrect = answerFeedback[currentQuestion.id];
    const hasAnswerFeedback = currentQuestion.id in answerFeedback;

    // Map choices to RadioForm format
    const options = currentQuestion.choices.map(choice => ({
        label: choice.text,
        value: `option${choice.id}`,
        isCorrect: false, // We don't know this on client side
    }));

    const isCorrect = hasAnswerFeedback && currentAnswerIsCorrect;
    const isFailed = hasAnswerFeedback && !currentAnswerIsCorrect;

    // Determine colors based on result
    const bgColor = isCorrect ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-primary-50";
    const progressColor = isCorrect ? "bg-green" : isFailed ? "bg-red" : "bg-primary-500";

    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    return (
        <ProtectedRoute allowedUserTypes={["student", "guest"]}>
            <div className="min-h-screen flex flex-col ">
            
            {/* Progress Bar Section */}
            <QuizProgressBar 
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                progressColor={progressColor}
                onBack={() => navigate("/student/dashboard")}
                onFlag={handleFinish}
                onMenu={() => console.log("Menu clicked")}
            />

            {/* Timer Section */}
            {currentQuestion.duration_sec && (
                <div className="flex justify-center mt-4">
                    <QuizTimer
                        durationSec={currentQuestion.duration_sec}
                        onTimeExpired={handleTimeExpired}
                        isActive={!isConfirmed}
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex items-start justify-center px-4 pb-8">
                <div className="w-full max-w-4xl">
                    {/* Card Container */}
                    <div className={`${bgColor} rounded-3xl px-18 py-8 shadow-md transition-colors duration-300`}>
                        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                            {/* Question and Options Section */}
                            <div className="flex-1 w-full flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <h3 className=" font-semibold text-primary-800">{question}</h3>
                                    <p className="text-xs text-red">*obligatoire</p>
                                </div>
                                <RadioForm
                                    options={options}
                                    isConfirmed={isConfirmed}
                                    onSelectionChange={selectOption}
                                />
                            </div>
                            
                            {/* Image Section */}
                            {currentQuestion.image_url && (
                                <div className="flex-1 w-full flex items-start justify-center lg:justify-end">
                                    <div className="relative w-full h-full flex items-start overflow-hidden rounded-2xl">
                                        <img 
                                            src={currentQuestion.image_url} 
                                            alt="Question" 
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                        {/* Zoom Button - positioned inside the image, clipped by border radius */}
                                        <button className={`absolute bottom-0 right-0 p-3 ${progressColor} text-white transition-colors rounded-tl-2xl ${progressColor === 'bg-green' ? 'hover:bg-green-700' : progressColor === 'bg-red' ? 'hover:bg-red-700' : 'hover:bg-primary-600'} cursor-pointer `}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            {isConfirmed && (
                                <button 
                                    onClick={handleNext}
                                    className={`px-6 py-2.5 text-white font-medium rounded-lg transition-colors ${
                                        progressColor === 'bg-green' ? 'bg-green hover:bg-green-700' : 
                                        progressColor === 'bg-red' ? 'bg-red hover:bg-red-700' : 
                                        'bg-primary-500 hover:bg-primary-600'
                                    }`}
                                >
                                    {isLastQuestion ? t("quiz.finish", "Terminer") : t("quiz.next", "Suivant")}
                                </button>
                            )}
                            {!isConfirmed && (
                                <button 
                                    onClick={handleConfirm}
                                    className={`px-6 py-2.5 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        progressColor === 'bg-green' ? 'bg-green hover:bg-green-700' : 
                                        progressColor === 'bg-red' ? 'bg-red hover:bg-red-700' : 
                                        'bg-primary-500 hover:bg-primary-600'
                                    }`}
                                    disabled={!selectedOption}
                                >
                                    Confirmer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </ProtectedRoute>
    )
}

export default Quiz