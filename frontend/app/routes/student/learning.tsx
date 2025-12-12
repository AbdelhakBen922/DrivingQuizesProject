import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { BookOpen, FileText, Video, CheckCircle, Clock, ArrowLeft } from "lucide-react";

export default function LearningPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    // Check if user is student or guest
    const userType = localStorage.getItem("userType");
    if (userType !== "student" && userType !== "guest") {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

  const handleBack = () => {
    navigate("/student/dashboard");
  };

  // Placeholder learning modules
  const learningModules = [
    {
      id: 1,
      title: isRTL ? "قواعد المرور الأساسية" : "Règles de circulation de base",
      description: isRTL
        ? "تعلم قواعد المرور الأساسية وإشارات الطريق"
        : "Apprenez les règles de circulation de base et les panneaux de signalisation",
      progress: 60,
      lessonsCount: 12,
      completedLessons: 7,
      icon: BookOpen,
    },
    {
      id: 2,
      title: isRTL ? "السلامة على الطريق" : "Sécurité routière",
      description: isRTL
        ? "فهم مبادئ السلامة والقيادة الدفاعية"
        : "Comprendre les principes de sécurité et de conduite défensive",
      progress: 30,
      lessonsCount: 10,
      completedLessons: 3,
      icon: FileText,
    },
    {
      id: 3,
      title: isRTL ? "دروس الفيديو" : "Leçons vidéo",
      description: isRTL
        ? "شاهد دروس الفيديو التعليمية"
        : "Regardez des leçons vidéo éducatives",
      progress: 0,
      lessonsCount: 15,
      completedLessons: 0,
      icon: Video,
    },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex items-center ${isRTL ? "flex-row-reverse" : "flex-row"} gap-4`}>
            <button
              onClick={handleBack}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                isRTL ? "rotate-180" : ""
              }`}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h1 className="text-2xl font-bold text-primary-800">
                {t("learning.title", "التعلم")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("learning.subtitle", "ادرس المواد التعليمية لتحسين معرفتك")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className="flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {t("learning.coming_soon", "قريباً")}
              </h3>
              <p className="text-blue-800">
                {t(
                  "learning.coming_soon_message",
                  "هذه الصفحة قيد التطوير. سيتم إضافة المحتوى التعليمي قريباً."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Learning Modules Preview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`flex items-start gap-4 mb-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className={`flex items-center justify-between mb-2 text-sm ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-gray-600">
                      {t("learning.progress", "التقدم")}
                    </span>
                    <span className="font-semibold text-gray-900">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className={`flex items-center gap-4 text-sm text-gray-600 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {module.completedLessons}/{module.lessonsCount} {t("learning.lessons", "دروس")}
                    </span>
                  </div>
                </div>

                {/* Disabled Button */}
                <button
                  disabled
                  className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  {t("learning.coming_soon", "قريباً")}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
