import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import NavBar from "~/components/NavBar";
import * as api from "~/services/api";

export default function SignUpPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    schoolName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch", "كلمات المرور غير متطابقة"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("auth.passwordTooShort", "كلمة المرور يجب أن تكون 6 أحرف على الأقل"));
      return;
    }

    setLoading(true);

    try {
      await api.register({
        school_name: formData.schoolName,
        owner_name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      // Auto-login after registration
      await api.login({ email: formData.email, password: formData.password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || t("auth.signupError", "فشل إنشاء الحساب"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-25 to-white">
      <NavBar dark={false} />

      <div className="flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-primary-800 mb-2">
              {t("auth.signupTitle", "إنشاء حساب جديد")}
            </h2>
            <p className="text-grey">
              {t("auth.signupSubtitle", "سجّل مدرستك وابدأ في إدارة طلابك")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red/10 border border-red/30 rounded-xl text-red text-sm text-center">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* School Name */}
            <div>
              <label className="form-label block mb-2">
                {t("auth.schoolName", "اسم المدرسة")}
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder={t("auth.schoolNamePlaceholder", "مدرسة السياقة")}
                className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={loading}
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="form-label block mb-2">
                {t("auth.ownerName", "اسم المالك")}
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder={t("auth.ownerNamePlaceholder", "الاسم الكامل")}
                className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="form-label block mb-2">
                {t("auth.email", "البريد الإلكتروني")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("auth.emailPlaceholder", "أدخل بريدك الإلكتروني")}
                className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="form-label block mb-2">
                {t("auth.phone", "رقم الهاتف")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("auth.phonePlaceholder", "+213 000 000 000")}
                className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="form-label block mb-2">
                {t("auth.password", "كلمة المرور")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("auth.passwordPlaceholder", "أدخل كلمة المرور")}
                className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label block mb-2">
                {t("auth.confirmPassword", "تأكيد كلمة المرور")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("auth.confirmPasswordPlaceholder", "أعد إدخال كلمة المرور")}
                className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? t("auth.creating", "جاري إنشاء الحساب...")
                : t("auth.signupButton", "إنشاء حساب")}
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

          {/* Login Link */}
          <p className="text-center text-grey">
            {t("auth.haveAccount", "لديك حساب بالفعل؟")}{" "}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-800 font-semibold transition-colors"
            >
              {t("auth.loginLink", "سجّل دخولك")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
