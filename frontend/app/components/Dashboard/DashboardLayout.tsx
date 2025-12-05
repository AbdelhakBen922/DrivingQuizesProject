import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
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
    <div className={`min-h-screen flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-gray-50`}>
      {/* Left Sidebar - Navigation - 270px base width, responsive */}
      <aside className="hidden lg:block w-[270px] flex-shrink-0">
        <Sidebar />
      </aside>
      
      {/* Main Content Body - Takes remaining space */}
      <main className="flex-1 overflow-x-hidden min-w-0">
        <div className="w-full h-full p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Calendar & Upcoming Quizzes - 480px base width, responsive */}
      <aside className="hidden xl:block w-[480px] flex-shrink-0 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 space-y-6">
          <CalendarWidget />
          <UpcomingQuizzes />
        </div>
      </aside>
    </div>
  );
}
