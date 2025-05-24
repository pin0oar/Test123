
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface PerformanceTimelineProps {
  totalValue: number;
}

type TimeWindow = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y';

export const PerformanceTimeline = ({ totalValue }: PerformanceTimelineProps) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<TimeWindow>('1M');

  const timeWindows: { key: TimeWindow; label: string }[] = [
    { key: '1D', label: '1D' },
    { key: '5D', label: '5D' },
    { key: '1M', label: '1M' },
    { key: '6M', label: '6M' },
    { key: 'YTD', label: 'YTD' },
    { key: '1Y', label: '1Y' },
    { key: '5Y', label: '5Y' },
  ];

  // Mock performance data - in real app this would come from API
  const generateMockData = (period: TimeWindow) => {
    const baseValue = totalValue;
    const dataPoints = period === '1D' ? 24 : period === '5D' ? 120 : 30;
    const variance = period === '1D' ? 0.02 : period === '5D' ? 0.05 : 0.1;
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const randomChange = (Math.random() - 0.5) * variance;
      const value = baseValue * (1 + randomChange * (i / dataPoints));
      const date = new Date();
      
      if (period === '1D') {
        date.setHours(date.getHours() - (dataPoints - i));
      } else {
        date.setDate(date.getDate() - (dataPoints - i));
      }
      
      return {
        date: date.toISOString(),
        value: Math.round(value),
        displayDate: period === '1D' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  };

  const chartData = generateMockData(selectedPeriod);
  const currentValue = chartData[chartData.length - 1]?.value || totalValue;
  const startValue = chartData[0]?.value || totalValue;
  const changeValue = currentValue - startValue;
  const changePercentage = ((changeValue / startValue) * 100);
  const isPositive = changeValue >= 0;

  const chartConfig = {
    value: {
      label: 'Portfolio Value',
      color: isPositive ? '#10b981' : '#ef4444',
    },
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('performance')}
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentValue, 'SAR')}
            </span>
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(changeValue, 'SAR')} ({isPositive ? '+' : ''}{changePercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {timeWindows.map((window) => (
            <Button
              key={window.key}
              variant={selectedPeriod === window.key ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-3 py-1"
              onClick={() => setSelectedPeriod(window.key)}
            >
              {window.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-80 mb-4">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
            >
              <XAxis 
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
                height={40}
                interval="preserveStartEnd"
              />
              <YAxis 
                hide
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value, 'SAR'), 'Portfolio Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: isPositive ? '#10b981' : '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};
