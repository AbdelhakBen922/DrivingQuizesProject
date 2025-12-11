import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardSchoolInfo } from "../../../../services/api";

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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(schoolInfo.name);
      setEmail(schoolInfo.email);
      setPhone(schoolInfo.phone);
      setAddress(schoolInfo.address);
    }
  }, [isOpen, schoolInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      phone,
      address,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
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
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.email", "البريد الإلكتروني")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              required
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
