import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as api from "../../../services/api";

interface Student {
  id: number;
  name: string;
  points: number;
  avatar: string;
  color: string;
  rank: number;
}

export default function TopStudents() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopStudents();
  }, []);

  const loadTopStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardOverview();
      
      // Transform API data to display format
      const transformed = data.top_students.map((student, index) => {
        const initials = student.full_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        
        return {
          id: student.student_id,
          name: student.full_name,
          points: Math.round(student.average_score * 100), // Convert to percentage-like score
          avatar: initials,
          color: getRankColor(index + 1),
          rank: index + 1,
        };
      });
      
      setStudents(transformed);
    } catch (err) {
      console.error('Failed to load top students:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500'; // Gold
    if (rank === 2) return 'bg-gray-400'; // Silver
    if (rank === 3) return 'bg-orange-600'; // Bronze
    return 'bg-primary-300'; // Same color for 4th and above
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-lg font-bold text-primary-800">
          {t('dashboard.topStudents.title', 'أفضل التلاميذ')}
        </h3>
      </div>

      {/* Students List */}
      <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar" style={{ maxHeight: '210px' }}>
        {loading ? (
          <div className="text-center py-4 text-grey text-sm">
            {t('common.loading', 'جاري التحميل...')}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-4 text-grey text-sm">
            {t('dashboard.topStudents.noStudents', 'لا يوجد طلاب بعد')}
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all"
            >
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar with rank color */}
                <div className={`w-10 h-10 ${student.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                  {student.avatar}
                </div>

                {/* Content */}
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-semibold text-primary-800 text-sm">{student.name}</p>
                  <p className="text-xs text-grey">{student.points} {t('dashboard.topStudents.points', 'نقطة')}</p>
                </div>

                {/* Rank Icon (only for top 3) */}
                {getRankIcon(student.rank) && (
                  <div className="text-xl">
                    {getRankIcon(student.rank)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
