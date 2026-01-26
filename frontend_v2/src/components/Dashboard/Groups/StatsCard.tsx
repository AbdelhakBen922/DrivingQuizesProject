import { useTranslation } from "react-i18next";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  bgColor?: string;
}

export default function StatsCard({ icon, label, value, bgColor = "bg-primary-100" }: StatsCardProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <img src={icon} alt={label} className="w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
        <p className="text-xs sm:text-sm text-grey font-medium">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-primary-800">{value}</p>
      </div>
    </div>
  );
}
