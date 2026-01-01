import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import { GraduationCap, Building2 } from "lucide-react";
import NavBar from "~/components/NavBar";
import * as api from "~/services/api";
import { useAuth } from "~/contexts/AuthContext";

type LoginMode = "staff" | "student";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, isStaff, isStudent } = useAuth();
  const isRTL = i18n.language === "ar";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isStaff) {
        navigate("/dashboard");
      } else if (isStudent) {
        navigate("/student/dashboard");
      }
    }
  }, [isAuthenticated, isStaff, isStudent, navigate]);

  // Check for pending student code from quick entry
  const pendingCode = localStorage.getItem("pendingStudentCode");
  
  const [mode, setMode] = useState<LoginMode>(pendingCode ? "student" : "staff");
  
  // Staff login fields
  const [email, setEmail] = useState("");
  
  // Student login fields
  const [studentCode, setStudentCode] = useState(pendingCode || "");
  
  // Clear pending code on mount
  useEffect(() => {
    if (pendingCode) {
      localStorage.removeItem("pendingStudentCode");
    }
  }, [pendingCode]);
  
  // Common fields
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login({ email, password });
      setAuth({ type: "staff", email });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || t("auth.loginError", "فشل تسجيل الدخول"));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.studentLogin({ student_code: studentCode, password });
      setAuth({ type: "student", studentCode });
      navigate("/student/dashboard");
    } catch (err: any) {
      setError(err.message || t("auth.studentLoginError", "فشل تسجيل دخول الطالب"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = mode === "staff" ? handleStaffLogin : handleStudentLogin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-white">
      <NavBar dark={false} />

      <div className="flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setMode("staff");
                setError("");
              }}
              className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "staff"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-50 text-grey hover:bg-gray-100"
              }`}
            >
              <Building2 size={20} />
              {t("auth.schoolLogin", "مدرسة")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("student");
                setError("");
              }}
              className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === "student"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-50 text-grey hover:bg-gray-100"
              }`}
            >
              <GraduationCap size={20} />
              {t("auth.studentLogin", "طالب")}
            </button>
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-primary-800 mb-2">
                {mode === "staff"
                  ? t("auth.staffLoginTitle", "تسجيل دخول المدرسة")
                  : t("auth.studentLoginTitle", "تسجيل دخول الطالب")}
              </h2>
              <p className="text-grey">
                {mode === "staff"
                  ? t("auth.staffLoginSubtitle", "قم بتسجيل الدخول لإدارة مدرستك")
                  : t("auth.studentLoginSubtitle", "قم بتسجيل الدخول لبدء الاختبار")}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red/10 border border-red/30 rounded-xl text-red text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "staff" ? (
                /* Staff Login Fields */
                <>
                  <div>
                    <label className="form-label block mb-2">
                      {t("auth.email", "البريد الإلكتروني")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder", "أدخل بريدك الإلكتروني")}
                      className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="form-label block mb-2">
                      {t("auth.password", "كلمة المرور")}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.passwordPlaceholder", "أدخل كلمة المرور")}
                      className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Forgot Password Link */}
                  <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-500 hover:text-primary-800 transition-colors"
                    >
                      {t("auth.forgotPassword", "نسيت كلمة المرور؟")}
                    </Link>
                  </div>
                </>
              ) : (
                /* Student Login Fields */
                <>
                  <div>
                    <label className="form-label block mb-2">
                      {t("auth.studentCode", "رمز الطالب")}
                    </label>
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      placeholder={t("auth.studentCodePlaceholder", "أدخل رمز الطالب")}
                      className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="form-label block mb-2">
                      {t("auth.password", "كلمة المرور")}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.passwordPlaceholder", "أدخل كلمة المرور")}
                      className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Quick Entry Link */}
                  <div className="text-center">
                    <Link
                      to="/select-quiz"
                      className="text-sm text-primary-500 hover:text-primary-800 transition-colors"
                    >
                      {t("auth.quickEntry", "دخول سريع برمز الطالب فقط")}
                    </Link>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("auth.loggingIn", "جاري تسجيل الدخول...")
                  : t("auth.loginButton", "تسجيل الدخول")}
              </button>
            </form>

            {/* Sign Up Link - Only for staff */}
            {mode === "staff" && (
              <>
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm text-grey">
                    {t("auth.or", "أو")}
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <p className="text-center text-grey">
                  {t("auth.noAccount", "ليس لديك حساب؟")}{" "}
                  <Link
                    to="/signup"
                    className="text-primary-500 hover:text-primary-800 font-semibold transition-colors"
                  >
                    {t("auth.signUpLink", "سجّل الآن")}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
