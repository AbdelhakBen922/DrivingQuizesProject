import { useTranslation } from "react-i18next";

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

  // Only show 3 most recent students
  const enrollments: Enrollment[] = [
    { id: 1, name: 'Zakaria Chetouane', group: 'Group 3', time: '3 days ago', avatar: 'ZC', color: 'bg-primary-300' },
    { id: 2, name: 'Ahmed Hassan', group: 'Group 2', time: '4 days ago', avatar: 'AH', color: 'bg-primary-300' },
    { id: 3, name: 'Sarah Mohamed', group: 'Group 12', time: '5 days ago', avatar: 'SM', color: 'bg-primary-300' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-lg font-bold text-primary-800">
          {t('dashboard.enrollments.title', 'New Enrollments')}
        </h3>
        <button className="text-primary-300 text-xs font-semibold hover:text-primary-600">
          {t('dashboard.enrollments.viewAll', 'View All')}
        </button>
      </div>

      {/* Enrollment List - Only 3 students */}
      <div className="space-y-3 flex-1">
        {enrollments.map((enrollment) => (
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

            {/* Days Ago - Most Right */}
            <div className="text-xs text-grey font-medium whitespace-nowrap">
              {enrollment.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
