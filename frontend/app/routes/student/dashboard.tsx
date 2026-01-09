import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import { ClipboardList, CheckCircle, Clock, TrendingUp, BookOpen, LogOut } from "lucide-react";
import * as api from "~/services/api";
import { useAuth } from "~/contexts/AuthContext";
import { ProtectedRoute } from "~/components/ProtectedRoute";

interface DashboardStats {
  total_quizzes: number;
  completed_quizzes: number;
  pending_quizzes: number;
  average_score: number;
  student_name: string;
  student_code: string;
}

interface AssignedQuiz {
  quiz_id: number;
  title: string;
  description: string | null;
  room_name: string;
  starts_at: string | null;
  due_date: string | null;
  time_limit_minutes: number | null;
  total_questions: number;
  status: "not_started" | "in_progress" | "completed";
  best_score: number | null;
  attempts_count: number;
  max_attempts: number | null;
  latest_attempt_id: number | null;
  is_active: boolean;
}

export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isRTL = i18n.language === "ar";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quizzes, setQuizzes] = useState<AssignedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, quizzesData] = await Promise.all([
        api.getStudentDashboardOverview(),
        api.getAssignedQuizzes(),
      ]);
      setStats(statsData);
      setQuizzes(quizzesData);
    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Force full page reload to clear all state and update navbar
    window.location.href = "/";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: { color: "bg-gray-100 text-gray-700", text: t("student.status.notStarted", "غير مبدوء") },
      in_progress: { color: "bg-yellow-100 text-yellow-700", text: t("student.status.inProgress", "قيد التقدم") },
      completed: { color: "bg-green-100 text-green-700", text: t("student.status.completed", "مكتمل") },
    };
    return badges[status as keyof typeof badges] || badges.not_started;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t("common.loading", "جاري التحميل...")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary">
            {t("common.retry", "إعادة المحاولة")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["student", "guest"]}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-3xl font-bold mb-2">
                {t("student.welcome", "مرحباً")}, {stats?.student_name}
              </h1>
              <p className="text-primary-100">
                {t("student.code", "الرمز")}: {stats?.student_code}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {t("common.logout", "تسجيل الخروج")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-gray-500 text-sm">{t("student.stats.total", "إجمالي الاختبارات")}</p>
                <p className="text-3xl font-bold text-primary-800 mt-1">{stats?.total_quizzes || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardList className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-gray-500 text-sm">{t("student.stats.completed", "مكتملة")}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completed_quizzes || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-gray-500 text-sm">{t("student.stats.pending", "قيد الانتظار")}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending_quizzes || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-gray-500 text-sm">{t("student.stats.avgScore", "المعدل")}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats?.average_score || 0}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            to="/student/learning"
            className="block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md p-6 transition-all"
          >
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-xl font-bold mb-1">{t("student.learning.title", "التعلم")}</h3>
                <p className="text-blue-100">{t("student.learning.description", "ادرس المواد التعليمية وحسّن معرفتك")}</p>
              </div>
              <BookOpen size={32} className="flex-shrink-0" />
            </div>
          </Link>
        </div>

        {/* Assigned Quizzes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className={`text-2xl font-bold text-primary-800 mb-6 ${isRTL ? "text-right" : "text-left"}`}>
            {t("student.assignedQuizzes", "الاختبارات المخصصة")}
          </h2>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">{t("student.noQuizzes", "لا توجد اختبارات مخصصة")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const badge = getStatusBadge(quiz.status);
                return (
                  <div
                    key={quiz.quiz_id}
                    className={`border border-gray-200 rounded-lg p-6 transition-shadow ${
                      quiz.is_active ? "hover:shadow-md" : "opacity-60"
                    }`}
                  >
                    <div className={`flex items-start justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`flex-1 ${isRTL ? "text-right mr-4" : "text-left ml-4"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-primary-800">{quiz.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${badge.color}`}>
                            {badge.text}
                          </span>
                          {!quiz.is_active && (
                            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                              {t("student.status.inactive", "غير نشط")}
                            </span>
                          )}
                        </div>
                        {quiz.description && (
                          <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                        )}
                        <div className={`flex flex-wrap gap-4 text-sm text-gray-500 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                          <span>📚 {quiz.room_name}</span>
                          <span>❓ {quiz.total_questions} {t("student.questions", "أسئلة")}</span>
                          {quiz.time_limit_minutes && (
                            <span>⏱️ {quiz.time_limit_minutes} {t("student.minutes", "دقيقة")}</span>
                          )}
                          {quiz.best_score !== null && (
                            <span className="text-green-600 font-medium">
                              ✓ {quiz.best_score}%
                            </span>
                          )}
                          {quiz.max_attempts && (
                            <span>
                              {t("student.attempts", "محاولات")}: {quiz.attempts_count}/{quiz.max_attempts}
                            </span>
                          )}
                        </div>
                      </div>
                      {quiz.status === "completed" || quiz.is_active ? (
                        <Link
                          to={
                            quiz.status === "completed" && quiz.latest_attempt_id
                              ? `/quiz/${quiz.quiz_id}/review/${quiz.latest_attempt_id}`
                              : `/quiz/${quiz.quiz_id}`
                          }
                          className="btn-primary whitespace-nowrap"
                        >
                          {quiz.status === "completed"
                            ? t("student.viewResults", "عرض النتائج")
                            : quiz.status === "in_progress"
                            ? t("student.continue", "متابعة")
                            : t("student.startQuiz", "بدء الاختبار")}
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="btn-primary whitespace-nowrap opacity-50 cursor-not-allowed"
                        >
                          {t("student.quizClosed", "مغلق")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
