import { Outlet } from "react-router";
import Sidebar from "../components/Dashboard/Sidebar";
import { useTranslation } from "react-i18next";

export default function DashboardLayout() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`flex min-h-screen bg-gray-50 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <Sidebar />
      <Outlet />
    </div>
  );
}
