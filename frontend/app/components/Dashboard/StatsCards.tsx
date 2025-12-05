import { useTranslation } from "react-i18next";

interface StatCard {
  key: string;
  iconPath: string;
  value: number;
  bgColorClass: string;
  bgColorHex: string;
}

export default function StatsCards() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stats: StatCard[] = [
    { key: 'groups', iconPath: '/assets/icons/dashboard/statistics/groups.svg', value: 13, bgColorClass: 'bg-primary-300', bgColorHex: '#1853f3' },
    { key: 'students', iconPath: '/assets/icons/dashboard/statistics/User_03.svg', value: 256, bgColorClass: 'bg-primary-800', bgColorHex: '#0a2161' },
    { key: 'quizzes', iconPath: '/assets/icons/dashboard/statistics/Select_Multiple.svg', value: 13, bgColorClass: 'bg-grey', bgColorHex: '#6d7d8b' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div 
              className="w-[60px] h-[60px] rounded-xl flex items-center justify-center p-[7.5px]"
              style={{ backgroundColor: stat.bgColorHex }}
            >
              <div className="w-full h-full bg-white bg-opacity-80 rounded-lg flex items-center justify-center p-1">
                <img 
                  src={stat.iconPath} 
                  alt={stat.key}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-grey text-sm font-medium">
                {t(`dashboard.stats.${stat.key}`, stat.key)}
              </p>
              <p className="text-4xl font-bold text-primary-800 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
