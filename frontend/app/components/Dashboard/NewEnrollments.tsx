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
    { id: 1, name: 'Zakaria Chetouane', group: 'Group 3', time: 'Dec 3, 2025', avatar: 'ZC', color: 'bg-primary-300' },
    { id: 2, name: 'Ahmed Hassan', group: 'Group 2', time: 'Dec 2, 2025', avatar: 'AH', color: 'bg-primary-300' },
    { id: 3, name: 'Sarah Mohamed', group: 'Group 12', time: 'Dec 1, 2025', avatar: 'SM', color: 'bg-primary-300' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-xl font-bold text-primary-800">
          {t('dashboard.enrollments.title', 'New Enrollments')}
        </h3>
        <button className="text-primary-300 text-sm font-semibold hover:text-primary-600">
          {t('dashboard.enrollments.viewAll', 'View All')}
        </button>
      </div>

      {/* Enrollment List - Only 3 students */}
      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Enrollment Date - Most Left */}
            <div className={`text-sm text-grey font-medium min-w-[90px] ${isRTL ? 'text-right' : 'text-left'}`}>
              {enrollment.time}
            </div>

            {/* Avatar */}
            <div className={`w-12 h-12 ${enrollment.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
              {enrollment.avatar}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="font-semibold text-primary-800">{enrollment.name}</p>
              <p className="text-sm text-grey">{enrollment.group}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
