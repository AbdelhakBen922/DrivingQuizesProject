import { Outlet } from "react-router";
import Sidebar from "../components/Dashboard/Sidebar";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function DashboardLayout() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <ProtectedRoute allowedUserTypes={["staff"]}>
      <div className={`flex flex-col lg:flex-row min-h-screen bg-gray-50 ${isRTL ? 'lg:flex-row' : 'lg:flex-row'}`}>
        <Sidebar />
        <main className="flex-1 w-full overflow-x-hidden pt-16 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
