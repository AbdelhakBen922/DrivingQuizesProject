import { useTranslation } from "react-i18next";

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

  // Up to 10 students, with gold/silver/bronze for top 3
  const students: Student[] = [
    { id: 1, name: 'Zakaria Chetouane', points: 9782, avatar: 'ZC', color: 'bg-yellow-500', rank: 1 },
    { id: 2, name: 'Ahmed Hassan', points: 8770, avatar: 'AH', color: 'bg-gray-400', rank: 2 },
    { id: 3, name: 'Sarah Mohamed', points: 7654, avatar: 'SM', color: 'bg-orange-600', rank: 3 },
    { id: 4, name: 'Omar Ali', points: 6770, avatar: 'OA', color: 'bg-primary-300', rank: 4 },
    { id: 5, name: 'Fatima Zahra', points: 6234, avatar: 'FZ', color: 'bg-primary-300', rank: 5 },
    { id: 6, name: 'Youssef Ibrahim', points: 5890, avatar: 'YI', color: 'bg-primary-300', rank: 6 },
    { id: 7, name: 'Amina Karim', points: 5456, avatar: 'AK', color: 'bg-primary-300', rank: 7 },
    { id: 8, name: 'Hassan Mahmoud', points: 5123, avatar: 'HM', color: 'bg-primary-300', rank: 8 },
    { id: 9, name: 'Layla Abdullah', points: 4890, avatar: 'LA', color: 'bg-primary-300', rank: 9 },
    { id: 10, name: 'Khalid Nasser', points: 4567, avatar: 'KN', color: 'bg-primary-300', rank: 10 },
  ];

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
          {t('dashboard.topStudents.title', 'Top Students')}
        </h3>
      </div>

      {/* Students List - Top 3 visible, scroll for remaining 7 */}
      <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar" style={{ maxHeight: '210px' }}>
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all"
          >
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar with rank color */}
              <div className={`w-10 h-10 ${getRankColor(student.rank)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                {student.avatar}
              </div>

              {/* Content */}
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="font-semibold text-primary-800 text-sm">{student.name}</p>
                <p className="text-xs text-grey">{student.points} Points</p>
              </div>

              {/* Rank Icon (only for top 3) */}
              {getRankIcon(student.rank) && (
                <div className="text-xl">
                  {getRankIcon(student.rank)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
