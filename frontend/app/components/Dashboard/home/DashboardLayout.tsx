import type { ReactNode } from "react";
import Sidebar from "../Sidebar";
import CalendarWidget from "./CalendarWidget";
import UpcomingQuizzes from "./UpcomingQuizzes";
import { useTranslation } from "react-i18next";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`h-screen flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-gray-50 overflow-hidden`}>
      {/* Left Sidebar - Navigation - 270px base width, fixed, no scroll */}
      <aside className="hidden lg:flex w-[270px] flex-shrink-0 h-screen overflow-hidden bg-primary-25">
        <Sidebar />
      </aside>
      
      {/* Main Content Body - No scrolling, fits in viewport */}
      <main className="flex-1 h-screen overflow-hidden min-w-0">
        <div className="w-full h-full p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Calendar & Upcoming Quizzes - 480px base width, fixed, no scrolling */}
      <aside className="hidden xl:flex w-[480px] flex-shrink-0 h-screen bg-primary-25 shadow-lg overflow-hidden">
        <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-[30px] space-y-3">
          <CalendarWidget />
          <UpcomingQuizzes />
        </div>
      </aside>
    </div>
  );
}
