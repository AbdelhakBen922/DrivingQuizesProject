import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, User, Mail, Phone, Calendar, Lock } from "lucide-react";
import * as api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

interface EditStudentModalProps {
  isOpen: boolean;
  student: api.Student;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStudentModal({ isOpen, student, onClose, onSuccess }: EditStudentModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [toasts, setToasts] = useState<any[]>([]);
  const { success, error } = useToast({ toasts, setToasts });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: student.full_name,
    student_code: student.student_code,
    dob: student.dob || "",
    national_id: student.national_id || "",
    email: student.email || "",
    phone: student.phone || "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t("students.modal.errors.nameRequired", "الاسم مطلوب");
    }

    if (!formData.student_code.trim()) {
      newErrors.student_code = t("students.modal.errors.codeRequired", "رمز الطالب مطلوب");
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("students.modal.errors.emailInvalid", "البريد الإلكتروني غير صالح");
    }

    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = t("students.modal.errors.phoneInvalid", "رقم الهاتف غير صالح");
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = t("students.modal.errors.passwordShort", "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("students.modal.errors.passwordMismatch", "كلمات المرور غير متطابقة");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const updateData: api.StudentUpdateRequest = {
        full_name: formData.full_name.trim(),
        student_code: formData.student_code.trim(),
        dob: formData.dob || null,
        national_id: formData.national_id.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.updateStudent(student.id, updateData);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to update student:", err);
      error(err.message || t("students.modal.updateError", "فشل تحديث الطالب"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary-800">
            {t("students.modal.editTitle", "تعديل الطالب")}
          </h2>
          <button
            onClick={onClose}
            className="text-grey hover:text-primary-800 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          <div className="space-y-4">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 border-b pb-2">
                {t("students.modal.basicInfo", "المعلومات الأساسية")}
              </h3>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <User size={16} className="inline mr-1" />
                  {t("students.modal.fullName", "الاسم الكامل")} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.full_name ? "border-red-500" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.modal.studentCode", "رمز الطالب")} *
                </label>
                <input
                  type="text"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.student_code ? "border-red-500" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                />
                {errors.student_code && <p className="text-red-500 text-sm mt-1">{errors.student_code}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Calendar size={16} className="inline mr-1" />
                  {t("students.modal.dob", "تاريخ الميلاد")}
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.modal.nationalId", "رقم التعريف الوطني")}
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 border-b pb-2">
                {t("students.modal.contactInfo", "معلومات الاتصال")}
              </h3>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Mail size={16} className="inline mr-1" />
                  {t("students.modal.email", "البريد الإلكتروني")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Phone size={16} className="inline mr-1" />
                  {t("students.modal.phone", "رقم الهاتف")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-800 border-b pb-2">
                {t("students.modal.changePassword", "تغيير كلمة المرور")} ({t("students.modal.optional", "اختياري")})
              </h3>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Lock size={16} className="inline mr-1" />
                  {t("students.modal.newPassword", "كلمة المرور الجديدة")}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium text-primary-800 mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <Lock size={16} className="inline mr-1" />
                  {t("students.modal.confirmPassword", "تأكيد كلمة المرور")}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } ${isRTL ? "text-right" : "text-left"}`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t border-gray-200 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-grey hover:text-primary-800 transition-colors"
            disabled={loading}
          >
            {t("common.cancel", "إلغاء")}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("common.loading", "جاري التحميل...") : t("students.modal.update", "تحديث")}
          </button>
        </div>
      </div>
    </div>
  );
}
