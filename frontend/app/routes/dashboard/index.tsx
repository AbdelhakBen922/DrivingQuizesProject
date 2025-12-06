import { useTranslation } from "react-i18next";

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`flex-1 bg-gray-50 p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h1 className="text-3xl font-bold text-primary-800 mb-4">
        {t('dashboard.title')}
      </h1>
      <p className="text-grey text-lg">
        {t('dashboard.welcome', 'Bienvenue sur votre tableau de bord')}
      </p>
    </div>
  );
}
