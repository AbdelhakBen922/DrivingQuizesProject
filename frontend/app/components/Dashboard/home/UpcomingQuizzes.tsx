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
    { id: 1, title: 'Road Signs Quiz', startDate: '8 Dec', endDate: '10 Dec', dayNumber: 8, group: 'Group 12', color: '#FFB800' },
    { id: 2, title: 'Priority Quiz', startDate: '13 Dec', endDate: '16 Dec', dayNumber: 13, group: 'Group 15', color: '#E91E63' },
    { id: 3, title: 'CrossOver Quiz', startDate: '18 Dec', endDate: '22 Dec', dayNumber: 18, group: 'Group 9', color: '#00C04D' },
    { id: 4, title: 'Final Quiz', startDate: '23 Dec', endDate: '24 Dec', dayNumber: 23, group: 'Group 12', color: '#2196F3' },
    { id: 5, title: 'Safety Quiz', startDate: '30 Dec', endDate: '31 Dec', dayNumber: 30, group: 'Group 7', color: '#ED2D30' },
  ];

  return (
    <div className="bg-white rounded-xl p-3 shadow-md flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between mb-2 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-base font-bold text-primary-800">
          {t('dashboard.upcoming.title', 'Upcoming Quizzes')}
        </h3>
      </div>

      {/* Quiz List - Single row layout */}
      <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="relative cursor-pointer transition-all hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: `${quiz.color}1A`,
              borderRadius: '15px',
              padding: '15px'
            }}
          >
            {/* Day Circle - Left */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: quiz.color }}
            >
              {quiz.dayNumber}
            </div>

            {/* Quiz Info - Center (3 rows: title, date range, group) */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-primary-800 text-xs truncate">{quiz.title}</h4>
              <p className="text-[10px] text-grey truncate">{quiz.startDate} - {quiz.endDate}</p>
              <p className="text-[10px] text-grey truncate">{quiz.group}</p>
            </div>

            {/* Arrow Icon - Far Right */}
            <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors flex-shrink-0">
              <svg className="w-4 h-4 text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
