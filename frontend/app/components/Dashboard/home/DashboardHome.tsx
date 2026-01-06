import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import StatsCards from "./StatsCards";
import QuizzesScoreChart from "./QuizzesScoreChart";
import LearningProgress from "./LearningProgress";
import NewEnrollments from "./NewEnrollments";
import TopStudents from "./TopStudents";
import * as api from "../../../services/api";

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    // Use cached settings to avoid extra latency on initial paint
    const cached = typeof window !== "undefined" ? sessionStorage.getItem("dashboardSettings") : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.school?.name) setSchoolName(parsed.school.name);
      } catch {
        // ignore parse errors
      }
    }

    async function loadSchool() {
      try {
        const settings = await api.getDashboardSettings();
        setSchoolName(settings.school.name);
        // cache for subsequent renders
        sessionStorage.setItem("dashboardSettings", JSON.stringify(settings));
      } catch (err) {
        console.error("Failed to load school name", err);
      }
    }
    loadSchool();
  }, []);

  const displaySchoolName = schoolName || t('dashboard.user.name', '[Nom de l\'école]');

  return (
    <div className="h-full flex flex-col gap-[15px] overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className={`${isRTL ? 'text-right' : 'text-left'} flex-shrink-0`}>
        <h1 className="text-2xl font-bold text-primary-800">
          {t('dashboard.welcome', { school: displaySchoolName, defaultValue: 'Welcome {{school}}!' })}
        </h1>
        <p className="text-grey text-sm mt-1">
          {t('dashboard.subtitle', 'Here is your overview')}
        </p>
      </div>

      {/* QUICK STATISTICS */}
      <div className="flex-shrink-0">
        <StatsCards />
      </div>

      {/* FIRST ROW: Quizzes Score Chart + Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] flex-1 min-h-0">
        {/* COLUMN 1: Quizzes Score Chart */}
        <QuizzesScoreChart />

        {/* COLUMN 2: Learning Progress */}
        <LearningProgress />
      </div>

      {/* SECOND ROW: New Enrollments + Top Students - Takes only needed space */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px] flex-shrink-0">
        {/* COLUMN 1: New Enrollments */}
        <NewEnrollments />

        {/* COLUMN 2: Top Students */}
        <TopStudents />
      </div>
    </div>
  );
}
