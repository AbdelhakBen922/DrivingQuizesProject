import { useTranslation } from "react-i18next";
import { useState } from "react";

interface ChartDataPoint {
  month: string;
  value: number;
}

export default function QuizzesScoreChart() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [filter, setFilter] = useState('overall');

  const months = isRTL 
    ? ['أبريل', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['April', 'October', 'November', 'December'];

  // Sample data
  const data: ChartDataPoint[] = [
    { month: months[0], value: 3 },
    { month: months[1], value: 2 },
    { month: months[2], value: 4 },
    { month: months[3], value: 2 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 className="text-xl font-bold text-primary-800">
          {t('dashboard.chart.quizScores', 'Quizzes Scores')}
        </h3>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-primary-50 text-primary-800 font-semibold px-4 py-2 pr-8 rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="overall">{t('dashboard.chart.overall', 'Overall')}</option>
            <option value="monthly">{t('dashboard.chart.monthly', 'Monthly')}</option>
            <option value="weekly">{t('dashboard.chart.weekly', 'Weekly')}</option>
          </select>
          <svg className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-4 h-4 text-primary-800 pointer-events-none`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-grey">
          {[4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0].map((val) => (
            <div key={val}>{val}</div>
          ))}
        </div>

        {/* Chart Area */}
        <div className={`${isRTL ? 'mr-8' : 'ml-8'} h-full relative`}>
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-t border-gray-200" />
            ))}
          </div>

          {/* Curve */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7498f8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7498f8" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,${100 - (data[0].value / maxValue) * 100} 
                  Q 25,${100 - (data[0].value / maxValue) * 80} 
                    33,${100 - (data[1].value / maxValue) * 100}
                  Q 45,${100 - (data[1].value / maxValue) * 85} 
                    66,${100 - (data[2].value / maxValue) * 100}
                  Q 80,${100 - (data[2].value / maxValue) * 90} 
                    100,${100 - (data[3].value / maxValue) * 100}
                  L 100,100 L 0,100 Z`}
              fill="url(#gradient)"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M 0,${100 - (data[0].value / maxValue) * 100} 
                  Q 25,${100 - (data[0].value / maxValue) * 80} 
                    33,${100 - (data[1].value / maxValue) * 100}
                  Q 45,${100 - (data[1].value / maxValue) * 85} 
                    66,${100 - (data[2].value / maxValue) * 100}
                  Q 80,${100 - (data[2].value / maxValue) * 90} 
                    100,${100 - (data[3].value / maxValue) * 100}`}
              fill="none"
              stroke="#4675f5"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Data Points */}
          <div className="absolute inset-0 flex items-end justify-around pb-2">
            {data.map((point, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center"
                style={{ height: `${(point.value / maxValue) * 100}%` }}
              >
                <div className="w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className={`absolute bottom-0 ${isRTL ? 'right-8 left-0' : 'left-8 right-0'} flex justify-around text-xs text-grey mt-2`}>
          {data.map((point, idx) => (
            <div key={idx}>{point.month}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
