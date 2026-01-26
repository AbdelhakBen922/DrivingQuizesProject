import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "~/components/NavBar";
import * as api from "~/services/api";
import { PublicRoute } from "~/components/ProtectedRoute";
import { validateEmail, validatePassword, validatePasswordMatch, validatePhoneNumber, validateRequired } from "~/lib/validators";

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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    setError("");
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validate school name
    const schoolNameResult = validateRequired(formData.schoolName, 'School name');
    if (!schoolNameResult.isValid) {
      errors.schoolName = schoolNameResult.error!;
    }

    // Validate owner name
    const ownerNameResult = validateRequired(formData.ownerName, 'Owner name');
    if (!ownerNameResult.isValid) {
      errors.ownerName = ownerNameResult.error!;
    }

    // Validate email
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error!;
    }

    // Validate phone
    const phoneResult = validatePhoneNumber(formData.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error!;
    }

    // Validate password
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error!;
    }

    // Validate password match
    const passwordMatchResult = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchResult.isValid) {
      errors.confirmPassword = passwordMatchResult.error!;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    if (!validateForm()) {
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
    <PublicRoute redirectAuthenticated={true}>
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
                className={`form-field ${isRTL ? "text-right" : "text-left"} ${fieldErrors.schoolName ? 'border-red focus:border-red' : ''}`}
                required
                disabled={loading}
              />
              {fieldErrors.schoolName && (
                <p className="text-red text-sm mt-1">{fieldErrors.schoolName}</p>
              )}
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
                className={`form-field ${isRTL ? "text-right" : "text-left"} ${fieldErrors.ownerName ? 'border-red focus:border-red' : ''}`}
                required
                disabled={loading}
              />
              {fieldErrors.ownerName && (
                <p className="text-red text-sm mt-1">{fieldErrors.ownerName}</p>
              )}
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
                className={`form-field ${isRTL ? "text-right" : "text-left"} ${fieldErrors.email ? 'border-red focus:border-red' : ''}`}
                required
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-red text-sm mt-1">{fieldErrors.email}</p>
              )}
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
                className={`form-field ${isRTL ? "text-right" : "text-left"} ${fieldErrors.phone ? 'border-red focus:border-red' : ''}`}
                required
                disabled={loading}
              />
              {fieldErrors.phone && (
                <p className="text-red text-sm mt-1">{fieldErrors.phone}</p>
              )}
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
                className={`form-field ${isRTL ? "text-right" : "text-left"} ${fieldErrors.password ? 'border-red focus:border-red' : ''}`}
                required
                disabled={loading}
                minLength={6}
              />
              {fieldErrors.password && (
                <p className="text-red text-sm mt-1">{fieldErrors.password}</p>
              )}
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
                className={`form-field ${isRTL ? "text-right" : "text-left"} ${fieldErrors.confirmPassword ? 'border-red focus:border-red' : ''}`}
                required
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red text-sm mt-1">{fieldErrors.confirmPassword}</p>
              )}
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
    </PublicRoute>
  );
}
