import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardOwnerInfo } from "../../../../services/api";

interface EditOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DashboardOwnerInfo>) => void;
  ownerInfo: DashboardOwnerInfo;
}

export default function EditOwnerModal({
  isOpen,
  onClose,
  onSave,
  ownerInfo,
}: EditOwnerModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Form state
  const [firstName, setFirstName] = useState(ownerInfo.first_name);
  const [lastName, setLastName] = useState(ownerInfo.last_name);
  const [email, setEmail] = useState(ownerInfo.email);
  const [phone, setPhone] = useState(ownerInfo.phone);
  const [avatar, setAvatar] = useState(ownerInfo.avatar_url);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFirstName(ownerInfo.first_name);
      setLastName(ownerInfo.last_name);
      setEmail(ownerInfo.email);
      setPhone(ownerInfo.phone);
      setAvatar(ownerInfo.avatar_url);
    }
  }, [isOpen, ownerInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      avatar_url: avatar,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real implementation, upload to server and get URL
      // For mock, we'll use object URL
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
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
            {t("settings.editOwnerInfo", "تعديل معلومات المالك")}
          </h2>
          <p className="text-gray-500 text-sm text-center mt-1">
            {t("settings.editOwnerSubtitle", "قم بتحديث معلومات المالك الشخصية")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                  {firstName[0]}{lastName[0]}
                </div>
              )}
            </div>
            <label className="cursor-pointer text-primary-600 hover:text-primary-800 text-sm flex items-center gap-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                className="w-3 h-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {t("settings.changePhoto", "تغيير الصورة")}
            </label>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.firstName", "الاسم الأول")}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.lastName", "الاسم الأخير")}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
