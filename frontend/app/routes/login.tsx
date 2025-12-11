import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import NavBar from "~/components/NavBar";
import * as api from "~/services/api";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || t("auth.loginError", "فشل تسجيل الدخول"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-white">
      <NavBar dark={false} />

      <div className="flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-md bg-white rounded-2xl shadow-xl p-8 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-primary-800 mb-2">
              {t("auth.loginTitle", "تسجيل الدخول")}
            </h2>
            <p className="text-grey">
              {t("auth.loginSubtitle", "مرحباً بك مجدداً! قم بتسجيل الدخول للمتابعة")}
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
            {/* Email Field */}
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

            {/* Password Field */}
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

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-grey">
              {t("auth.or", "أو")}
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-grey">
            {t("auth.noAccount", "ليس لديك حساب؟")}{" "}
            <Link
              to="/signup"
              className="text-primary-500 hover:text-primary-800 font-semibold transition-colors"
            >
              {t("auth.signUpLink", "سجّل الآن")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
