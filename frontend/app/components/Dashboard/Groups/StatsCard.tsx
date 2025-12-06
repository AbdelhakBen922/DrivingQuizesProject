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
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <img src={icon} alt={label} className="w-7 h-7" />
      </div>
      <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
        <p className="text-sm text-grey font-medium">{label}</p>
        <p className="text-2xl font-bold text-primary-800">{value}</p>
      </div>
    </div>
  );
}
