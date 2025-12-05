import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function CalendarWidget() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [currentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Sample highlighted dates
  const highlightedDates = [8, 13, 18, 23, 30];

  const monthNames = isRTL 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = isRTL
    ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className={`w-5 h-5 text-grey ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-bold text-primary-800">
          {t('dashboard.calendar.title', 'Calendar')}
        </h3>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className={`w-5 h-5 text-grey ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Month/Year */}
      <div className={`text-center mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <p className="text-sm text-grey">
          {monthNames[currentMonth]} {currentYear}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day Names */}
        <div className={`grid grid-cols-7 gap-2 ${isRTL ? 'direction-rtl' : ''}`}>
          {dayNames.map((day, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-grey">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className={`grid grid-cols-7 gap-2 ${isRTL ? 'direction-rtl' : ''}`}>
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm
                transition-all cursor-pointer
                ${day === null ? 'invisible' : ''}
                ${day === currentDate.getDate() 
                  ? 'bg-blue-500 text-white font-bold' 
                  : highlightedDates.includes(day!)
                  ? 'bg-primary-100 text-primary-800 font-semibold'
                  : 'hover:bg-gray-100 text-grey'
                }
              `}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
