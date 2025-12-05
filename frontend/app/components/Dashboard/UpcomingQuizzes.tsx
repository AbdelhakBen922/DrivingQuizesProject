import { useTranslation } from "react-i18next";

interface Quiz {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  dayNumber: number;
  group: string;
  color: string;
}

export default function UpcomingQuizzes() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const quizzes: Quiz[] = [
    { id: 1, title: 'Road Signs Quiz', startDate: '8 Dec', endDate: '10 Dec', dayNumber: 8, group: 'Group 12', color: 'bg-yellow-400' },
    { id: 2, title: 'Priority Quiz', startDate: '13 Dec', endDate: '16 Dec', dayNumber: 13, group: 'Group 15', color: 'bg-pink-400' },
    { id: 3, title: 'CrossOver Quiz', startDate: '18 Dec', endDate: '22 Dec', dayNumber: 18, group: 'Group 9', color: 'bg-green-400' },
    { id: 4, title: 'Final Quiz', startDate: '23 Dec', endDate: '24 Dec', dayNumber: 23, group: 'Group 12', color: 'bg-blue-400' },
    { id: 5, title: 'Safety Quiz', startDate: '30 Dec', endDate: '31 Dec', dayNumber: 30, group: 'Group 7', color: 'bg-red-400' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-xl font-bold text-primary-800">
          {t('dashboard.upcoming.title', 'Upcoming Quizzes')}
        </h3>
      </div>

      {/* Quiz List - Single row layout */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className={`
              ${quiz.color} bg-opacity-20 rounded-xl p-3 
              cursor-pointer hover:bg-opacity-30 transition-all
              flex items-center gap-3
            `}
          >
            {/* Day Circle - Left */}
            <div className={`w-12 h-12 ${quiz.color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
              {quiz.dayNumber}
            </div>

            {/* Quiz Info - Center (3 rows: title, date range, group) */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-primary-800 text-sm truncate">{quiz.title}</h4>
              <p className="text-xs text-grey truncate">{quiz.startDate} - {quiz.endDate}</p>
              <p className="text-xs text-grey truncate">{quiz.group}</p>
            </div>

            {/* Arrow Icon - Far Right */}
            <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors flex-shrink-0">
              <svg className="w-5 h-5 text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
