import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as api from "../../../services/api";
import EditSchoolModal from "./Modals/EditSchoolModal";
import EditOwnerModal from "./Modals/EditOwnerModal";
import { useToast, type ToastItem } from "../../../hooks/useToast";
import ToastContainer from "../../Toast/ToastContainer";
import LanguageToggle from "../../LanguageToggle";

type SchoolInfo = api.DashboardSchoolInfo;
type OwnerInfo = api.DashboardOwnerInfo;

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { success, error: showError, removeToast } = useToast({ toasts, setToasts });

  // Data state
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [isEditOwnerModalOpen, setIsEditOwnerModalOpen] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      // Serve immediately from cache if present
      const cached = typeof window !== "undefined" ? sessionStorage.getItem("dashboardSettings") : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSchoolInfo(parsed.school);
          setOwnerInfo(parsed.owner);
        } catch {
          /* ignore */
        }
      }

      const settings = await api.getDashboardSettings();
      setSchoolInfo(settings.school);
      setOwnerInfo(settings.owner);
      sessionStorage.setItem("dashboardSettings", JSON.stringify(settings));
    } catch (err: any) {
      showError(err.message || t("settings.loadError", "فشل تحميل الإعدادات"));
    } finally {
      setLoading(false);
    }
  }

  // Handlers
  async function handleSaveSchool(data: Partial<SchoolInfo>) {
    try {
      const updated = await api.updateSchoolSettings(data as api.DashboardSchoolUpdate);
      setSchoolInfo(updated);
      setIsEditSchoolModalOpen(false);
      success(t("settings.schoolUpdated", "تم تحديث معلومات المدرسة بنجاح"));
    } catch (err: any) {
      showError(err.message || t("settings.updateError", "فشل تحديث المعلومات"));
    }
  }

  async function handleSaveOwner(data: Partial<OwnerInfo>) {
    try {
      const updated = await api.updateOwnerSettings(data as api.DashboardOwnerUpdate);
      setOwnerInfo(updated);
      setIsEditOwnerModalOpen(false);
      success(t("settings.ownerUpdated", "تم تحديث معلومات المالك بنجاح"));
    } catch (err: any) {
      showError(err.message || t("settings.updateError", "فشل تحديث المعلومات"));
    }
  }

  if (loading || !schoolInfo || !ownerInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">{t("common.loading", "جاري التحميل...")}</div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Page Header with language selector */}
      <div className="flex items-center justify-between gap-4">
        {isRTL ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-primary-800">
                {t("settings.title", "الإعدادات")}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {t("settings.subtitle", "قم بتعديل معلومات المالك والمدرسة")}
              </p>
            </div>
            <div className="flex-shrink-0">
              <LanguageToggle dark={false} />
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-primary-800">
                {t("settings.title", "الإعدادات")}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {t("settings.subtitle", "قم بتعديل معلومات المالك والمدرسة")}
              </p>
            </div>
            <div className="flex-shrink-0">
              <LanguageToggle dark={false} />
            </div>
          </>
        )}
      </div>

      {/* School Information Card */}
      <div className="bg-blue-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-primary-800">
            {t("settings.schoolInfo", "معلومات المدرسة")}
          </h2>
          <button
            onClick={() => setIsEditSchoolModalOpen(true)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
          >
            {isRTL ? (
              <>
                <span>{t("settings.edit", "تعديل")}</span>
                <span className="text-lg">{"<"}</span>
              </>
            ) : (
              <>
                <span>{t("settings.edit", "Modifier")}</span>
                <span className="text-lg">{">"}</span>
              </>
            )}
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? "" : "direction-ltr"}`}>
          {/* School Name */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.schoolName", "إسم المدرسة")}
            </p>
            <p className="text-gray-800 font-medium">{schoolInfo.name}</p>
          </div>

          {/* Address */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.address", "العنوان")}
            </p>
            <p className="text-gray-800 font-medium">{schoolInfo.address}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.email", "البريد الإلكتروني")}
            </p>
            <p className="text-gray-800 font-medium" dir="ltr">{schoolInfo.email}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.phone", "رقم الهاتف")}
            </p>
            <p className="text-gray-800 font-medium" dir="ltr">{schoolInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Owner Information Card */}
      <div className="bg-blue-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-primary-800">
            {t("settings.ownerInfo", "معلومات المالك")}
          </h2>
          <button
            onClick={() => setIsEditOwnerModalOpen(true)}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors"
          >
            {isRTL ? (
              <>
                <span>{t("settings.edit", "تعديل")}</span>
                <span className="text-lg">{"<"}</span>
              </>
            ) : (
              <>
                <span>{t("settings.edit", "Modifier")}</span>
                <span className="text-lg">{">"}</span>
              </>
            )}
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isRTL ? "" : "direction-ltr"}`}>
          {/* First Name */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.firstName", "الاسم الأول")}
            </p>
            <p className="text-gray-800 font-medium">{ownerInfo.first_name}</p>
          </div>

          {/* Last Name */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.lastName", "الاسم الأخير")}
            </p>
            <p className="text-gray-800 font-medium">{ownerInfo.last_name}</p>
          </div>

          {/* Avatar */}
          <div className={`row-span-2 ${isRTL ? "md:order-last" : "md:order-first"}`}>
            <p className="text-sm text-gray-500 mb-2">
              {t("settings.profilePhoto", "الصورة الشخصية")}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                {ownerInfo.avatar_url ? (
                  <img
                    src={ownerInfo.avatar_url}
                    alt={`${ownerInfo.first_name} ${ownerInfo.last_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                          ${ownerInfo.first_name[0]}${ownerInfo.last_name[0]}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                    {ownerInfo.first_name[0]}{ownerInfo.last_name[0]}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsEditOwnerModalOpen(true)}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
              >
                <img
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  className="w-3 h-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {t("settings.editPhoto", "تعديل")}
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.email", "البريد الإلكتروني")}
            </p>
            <p className="text-gray-800 font-medium" dir="ltr">{ownerInfo.email}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t("settings.phone", "رقم الهاتف")}
            </p>
            <p className="text-gray-800 font-medium" dir="ltr">{ownerInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditSchoolModal
        isOpen={isEditSchoolModalOpen}
        onClose={() => setIsEditSchoolModalOpen(false)}
        onSave={handleSaveSchool}
        schoolInfo={schoolInfo}
      />

      <EditOwnerModal
        isOpen={isEditOwnerModalOpen}
        onClose={() => setIsEditOwnerModalOpen(false)}
        onSave={handleSaveOwner}
        ownerInfo={ownerInfo}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
