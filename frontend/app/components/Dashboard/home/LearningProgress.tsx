import { useTranslation } from "react-i18next";

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

  const progressData: ProgressItem[] = [
    { key: 'group3', group: 'Group 3', subject: 'Turning Priorities', percentage: 75, color: 'bg-blue-500' },
    { key: 'group12', group: 'Group 12', subject: 'Cross Overs', percentage: 51, color: 'bg-blue-500' },
    { key: 'group1', group: 'Group 1', subject: 'Road Signs', percentage: 23, color: 'bg-blue-500' },
    { key: 'group5', group: 'Group 5', subject: 'Final Quiz', percentage: 97, color: 'bg-blue-500' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-lg font-bold text-primary-800">
          {t('dashboard.progress.title', 'Learning Progress')}
        </h3>
        <button className="text-primary-500 text-xs font-semibold hover:text-primary-600">
          {t('dashboard.progress.seeAll', 'See All')}
          <span className={isRTL ? ' mr-1' : ' ml-1'}>→</span>
        </button>
      </div>

      {/* Progress Items - Scrollable */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-2">
        {progressData.map((item) => (
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
        ))}
      </div>
    </div>
  );
}
