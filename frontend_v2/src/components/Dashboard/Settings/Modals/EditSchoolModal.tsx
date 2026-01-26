import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardSchoolInfo } from "../../../../services/api";
import { validateEmail, validatePhoneNumber, validateRequired } from "../../../../lib/validators";

interface EditSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DashboardSchoolInfo>) => void;
  schoolInfo: DashboardSchoolInfo;
}

export default function EditSchoolModal({
  isOpen,
  onClose,
  onSave,
  schoolInfo,
}: EditSchoolModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Form state
  const [name, setName] = useState(schoolInfo.name);
  const [email, setEmail] = useState(schoolInfo.email);
  const [phone, setPhone] = useState(schoolInfo.phone);
  const [address, setAddress] = useState(schoolInfo.address);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(schoolInfo.name);
      setEmail(schoolInfo.email);
      setPhone(schoolInfo.phone);
      setAddress(schoolInfo.address);
      setErrors({});
    }
  }, [isOpen, schoolInfo]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    const nameResult = validateRequired(name, 'School name');
    if (!nameResult.isValid) {
      newErrors.name = nameResult.error!;
    }

    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error!;
    }

    const phoneResult = validatePhoneNumber(phone);
    if (!phoneResult.isValid) {
      newErrors.phone = phoneResult.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      name,
      email,
      phone,
      address,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold text-primary-800 text-center">
            {t("settings.editSchoolInfo", "تعديل معلومات المدرسة")}
          </h2>
          <p className="text-gray-500 text-sm text-center mt-1">
            {t("settings.editSchoolSubtitle", "أدخل معلومات المجموعة وسيتم إنشاء كود المجموعة تلقائيًا")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* School Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.schoolName", "إسم المدرسة")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                errors.name ? 'border-red focus:ring-red' : 'border-gray-200'
              } ${isRTL ? "text-right" : "text-left"}`}
              required
            />
            {errors.name && <p className="text-red text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.email", "البريد الإلكتروني")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              dir="ltr"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                errors.email ? 'border-red focus:ring-red' : 'border-gray-200'
              }`}
              placeholder="school@example.com"
              required
            />
            {errors.email && <p className="text-red text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.phone", "رقم الهاتف")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                errors.phone ? 'border-red focus:ring-red' : 'border-gray-200'
              } ${isRTL ? "text-right" : "text-left"}`}
              placeholder="0123456789"
              required
            />
            {errors.phone && <p className="text-red text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.address", "العنوان")}
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              rows={3}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.address", "العنوان")}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.phone", "رقم الهاتف")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              required
            />
          </div>

          {/* Buttons */}
          <div className={`flex items-center justify-center gap-4 pt-4 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
            <button
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              {t("settings.saveInfo", "حفظ المعلومات")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {t("settings.cancel", "إلغاء")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
