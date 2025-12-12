import { Outlet, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import { useTranslation } from "react-i18next";
import * as api from "../services/api";

export default function DashboardLayout() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!api.isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    // Check user type - only staff can access dashboard
    const userType = localStorage.getItem("userType");
    if (userType === "student" || userType === "guest") {
      // Redirect students to student dashboard
      navigate("/student/dashboard");
      return;
    }
    
    setIsChecking(false);
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen bg-gray-50 ${isRTL ? 'lg:flex-row' : 'lg:flex-row'}`}>
      <Sidebar />
      <main className="flex-1 w-full overflow-x-hidden pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
