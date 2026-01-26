import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as api from "../../../services/api";

interface Enrollment {
  id: number;
  name: string;
  group: string;
  time: string;
  avatar: string;
  color: string;
}

export default function NewEnrollments() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardOverview();
      
      // Transform API data to display format
      const transformed = data.recent_registrations.slice(0, 3).map((reg, index) => {
        const initials = reg.full_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        
        // Calculate time ago
        const createdAt = new Date(reg.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const timeAgo = diffDays === 0 
          ? t('dashboard.enrollments.today', 'اليوم')
          : diffDays === 1 
            ? t('dashboard.enrollments.yesterday', 'أمس')
            : t('dashboard.enrollments.daysAgo', '{{days}} أيام', { days: diffDays });
        
        return {
          id: reg.student_id,
          name: reg.full_name,
          group: reg.room_name || t('dashboard.enrollments.noGroup', 'بدون مجموعة'),
          time: timeAgo,
          avatar: initials,
          color: 'bg-primary-300',
        };
      });
      
      setEnrollments(transformed);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      // Keep empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-lg font-bold text-primary-800">
          {t('dashboard.enrollments.title', 'التسجيلات الجديدة')}
        </h3>
        <button className="text-primary-300 text-xs font-semibold hover:text-primary-600">
          {t('dashboard.enrollments.viewAll', 'رؤية الكل')}
        </button>
      </div>

      {/* Enrollment List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-grey text-sm">
            {t('common.loading', 'جاري التحميل...')}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-4 text-grey text-sm">
            {t('dashboard.enrollments.noEnrollments', 'لا توجد تسجيلات جديدة')}
          </div>
        ) : (
          enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 ${enrollment.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                {enrollment.avatar}
              </div>

              {/* Content */}
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="font-semibold text-primary-800 text-sm">{enrollment.name}</p>
                <p className="text-xs text-grey">{enrollment.group}</p>
              </div>

              {/* Days Ago */}
              <div className="text-xs text-grey font-medium whitespace-nowrap">
                {enrollment.time}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
