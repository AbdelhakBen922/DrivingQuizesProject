import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import * as api from "../../../services/api"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

export const description = "Quizzes Score Chart"

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface ChartDataPoint {
  month: string;
  score: number;
}

export default function QuizzesScoreChart() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Month names in French and Arabic
  const monthNames = {
    fr: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  };

  const currentMonths = i18n.language === 'ar' ? monthNames.ar : monthNames.fr;

  useEffect(() => {
    loadChartData();
  }, [i18n.language]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardOverview();
      
      // Transform API data to chart format
      const transformed = data.exam_results.map((item) => {
        const date = new Date(item.date);
        const monthIndex = date.getMonth();
        const monthName = currentMonths[monthIndex];
        
        return {
          month: monthName,
          score: Math.round(item.average_score * 10) / 10, // Round to 1 decimal
        };
      });
      
      setChartData(transformed);
    } catch (err) {
      console.error('Failed to load chart data:', err);
      // Set empty data on error
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-lg font-bold text-primary-800">
          {t('dashboard.chart.quizScores', 'نتائج الاختبارات')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4 pt-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-grey text-sm">
            {t('common.loading', 'جاري التحميل...')}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-grey text-sm">
            {t('dashboard.chart.noData', 'لا توجد بيانات')}
          </div>
        ) : (
          <ChartContainer className="h-full w-full" config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="score"
                type="natural"
                fill="var(--chart-1)"
                fillOpacity={0.4}
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
