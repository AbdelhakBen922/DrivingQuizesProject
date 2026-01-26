import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as api from "../../../services/api";

interface ProgressItem {
  key: string;
  group: string;
  subject: string;
  percentage: number;
  color: string;
}

export default function LearningProgress() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardOverview();
      
      // Transform API data to display format
      const transformed = data.study_progress.map((item, index) => ({
        key: `room-${item.room_id}`,
        group: item.room_name,
        subject: `${item.completed_lessons}/${item.total_lessons} ${t('dashboard.progress.lessons', 'دروس')}`,
        percentage: Math.round(item.progress_percentage),
        color: 'bg-blue-500',
      }));
      
      setProgressData(transformed);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-lg font-bold text-primary-800">
          {t('dashboard.progress.title', 'تقدم التعلم')}
        </h3>
        <button className="text-primary-500 text-xs font-semibold hover:text-primary-600">
          {t('dashboard.progress.seeAll', 'عرض الكل')}
          <span className={isRTL ? ' mr-1' : ' ml-1'}>→</span>
        </button>
      </div>

      {/* Progress Items - Scrollable */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-center py-4 text-grey text-sm">
            {t('common.loading', 'جاري التحميل...')}
          </div>
        ) : progressData.length === 0 ? (
          <div className="text-center py-4 text-grey text-sm">
            {t('dashboard.progress.noData', 'لا توجد بيانات تقدم')}
          </div>
        ) : (
          progressData.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              {/* Text Content - Group name and topic */}
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="font-semibold text-primary-800 text-sm">{item.group}</p>
                <p className="text-xs text-grey">{item.subject}</p>
              </div>

              {/* Circle Progress - Most Right (shows percentage) */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  {/* Background circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#1853f3"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={125.66}
                    strokeDashoffset={125.66 * (1 - item.percentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-800">{item.percentage}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
