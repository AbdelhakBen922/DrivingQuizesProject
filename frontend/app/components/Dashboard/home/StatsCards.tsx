import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as api from "../../../services/api";

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
  const [stats, setStats] = useState<api.DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStatsDetailed();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsData: StatCard[] = [
    { key: 'groups', iconPath: '/assets/icons/dashboard/statistics/groups.svg', value: stats?.total_groups || 0, bgColorClass: 'bg-primary-300', bgColorHex: '#D0E7E9' },
    { key: 'students', iconPath: '/assets/icons/dashboard/statistics/User_03.svg', value: stats?.total_students || 0, bgColorClass: 'bg-primary-800', bgColorHex: '#E8DAEA' },
    { key: 'quizzes', iconPath: '/assets/icons/dashboard/statistics/Select_Multiple.svg', value: stats?.active_exams || 0, bgColorClass: 'bg-grey', bgColorHex: '#D1DDFD' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statsData.map((stat) => (
        <div
          key={stat.key}
          className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200"
        >
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div 
              className="w-[50px] h-[50px] rounded-lg flex items-center justify-center p-3"
              style={{ backgroundColor: stat.bgColorHex }}
            >
              <img 
                src={stat.iconPath} 
                alt={stat.key}
                className="w-full h-full object-contain"
              />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-grey text-xs font-medium">
                {t(`dashboard.stats.${stat.key}`, stat.key)}
              </p>
              <p className="text-3xl font-bold text-primary-800 mt-0.5">
                {loading ? '...' : stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
