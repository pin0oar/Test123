
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MarketOverview = () => {
  const { t } = useLanguage();

  // Mock market data - in real app this would come from API
  const markets = [
    {
      name: 'Tadawul (TASI)',
      value: 11567.45,
      change: 45.23,
      changePercent: 0.39,
      currency: 'SAR'
    },
    {
      name: 'S&P 500',
      value: 4789.32,
      change: -23.45,
      changePercent: -0.49,
      currency: 'USD'
    },
    {
      name: 'NASDAQ',
      value: 15234.67,
      change: 67.89,
      changePercent: 0.45,
      currency: 'USD'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('marketOverview')}
      </h3>
      
      <div className="space-y-4">
        {markets.map((market, index) => {
          const isPositive = market.change >= 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {market.name}
                </h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {market.value.toLocaleString()}
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                  </span>
                </div>
                <p className={`text-xs ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : ''}{market.change.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        {t('delayedData')}
      </p>
    </Card>
  );
};
