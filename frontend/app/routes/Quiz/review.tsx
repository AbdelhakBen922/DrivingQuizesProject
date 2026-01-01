import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import * as api from "~/services/api";
import { useAuth } from "~/contexts/AuthContext";
import NavBar from "~/components/NavBar";

interface ReviewQuestion {
    id: number;
    text: string;
    image_url: string | null;
    student_answer_choice_id: number | null;
    correct_choice_id: number;
    is_correct: boolean;
    choices: Array<{
        id: number;
        text: string;
        position: number;
    }>;
}

interface ReviewData {
    attempt_id: number;
    quiz_title: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    percentage: number;
    passed: boolean;
    questions: ReviewQuestion[];
}

const QuizReview = () => {
    const { quizId, attemptId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, isLoading: authLoading } = useAuth();

    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        if (!user || user.type !== 'student') {
            navigate("/");
            return;
        }

        if (!quizId || !attemptId) {
            navigate("/student/dashboard");
            return;
        }

        loadReview();
    }, [quizId, attemptId, user, authLoading]);

    const loadReview = async () => {
        try {
            setLoading(true);
            const lang = i18n.language?.startsWith("ar") ? "ar" : "fr";
            const data = await api.getQuizReview(parseInt(quizId!), parseInt(attemptId!), lang);
            setReviewData(data);
        } catch (err: any) {
            console.error("Failed to load quiz review:", err);
            setError(err.message || "Failed to load quiz review");
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">{t("common.loading", "Loading...")}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => navigate("/student/dashboard")} className="btn-primary">
                        {t("common.backToDashboard", "Back to Dashboard")}
                    </button>
                </div>
            </div>
        );
    }

    if (!reviewData) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar dark={false} />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header with Results */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="text-center mb-6">
                        <h1 className={`text-3xl font-bold mb-2 ${reviewData.passed ? "text-green-600" : "text-red-600"}`}>
                            {reviewData.passed ? t("quiz.passed", "Passed!") : t("quiz.failed", "Failed")}
                        </h1>
                        <p className="text-gray-600 text-xl">{reviewData.quiz_title}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-blue-600 text-sm mb-1">{t("quiz.score", "Score")}</p>
                            <p className="text-3xl font-bold text-blue-800">{reviewData.percentage}%</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-green-600 text-sm mb-1">{t("quiz.correct", "Correct")}</p>
                            <p className="text-3xl font-bold text-green-800">
                                {reviewData.correct_answers}/{reviewData.total_questions}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <p className="text-purple-600 text-sm mb-1">{t("quiz.finalScore", "Final Score")}</p>
                            <p className="text-3xl font-bold text-purple-800">{reviewData.score}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/student/dashboard")}
                        className="w-full md:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        {t("common.backToDashboard", "Back to Dashboard")}
                    </button>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {t("quiz.reviewAnswers", "Review Your Answers")}
                    </h2>

                    {reviewData.questions.map((question, index) => {
                        const studentChoice = question.choices.find(c => c.id === question.student_answer_choice_id);
                        const correctChoice = question.choices.find(c => c.id === question.correct_choice_id);

                        return (
                            <div
                                key={question.id}
                                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                                    question.is_correct ? "border-green-500" : "border-red-500"
                                }`}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    {question.is_correct ? (
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                                    ) : (
                                        <XCircle className="text-red-500 flex-shrink-0" size={24} />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 mb-1">
                                            {t("quiz.question", "Question")} {index + 1}
                                        </p>
                                        <p className="text-gray-700">{question.text}</p>
                                    </div>
                                </div>

                                {question.image_url && (
                                    <div className="mb-4">
                                        <img
                                            src={question.image_url}
                                            alt={`Question ${index + 1}`}
                                            className="w-full max-w-md rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {question.choices.map((choice) => {
                                        const isStudentAnswer = choice.id === question.student_answer_choice_id;
                                        const isCorrectAnswer = choice.id === question.correct_choice_id;

                                        return (
                                            <div
                                                key={choice.id}
                                                className={`p-3 rounded-lg border-2 ${
                                                    isCorrectAnswer
                                                        ? "bg-green-50 border-green-500"
                                                        : isStudentAnswer
                                                        ? "bg-red-50 border-red-500"
                                                        : "bg-gray-50 border-gray-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isCorrectAnswer && (
                                                        <CheckCircle className="text-green-600" size={20} />
                                                    )}
                                                    {isStudentAnswer && !isCorrectAnswer && (
                                                        <XCircle className="text-red-600" size={20} />
                                                    )}
                                                    <span
                                                        className={`${
                                                            isCorrectAnswer
                                                                ? "font-semibold text-green-800"
                                                                : isStudentAnswer
                                                                ? "font-semibold text-red-800"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {choice.text}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {!question.is_correct && (
                                    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-semibold">{t("quiz.yourAnswer", "Your answer")}:</span>{" "}
                                            {studentChoice?.text || t("quiz.notAnswered", "Not answered")}
                                        </p>
                                        <p className="text-sm text-blue-800 mt-1">
                                            <span className="font-semibold">{t("quiz.correctAnswer", "Correct answer")}:</span>{" "}
                                            {correctChoice?.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizReview;
