
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';
import { Portfolio } from '@/types/portfolio';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface PortfolioDetailOverviewProps {
  portfolio: Portfolio;
}

export const PortfolioDetailOverview = ({ portfolio }: PortfolioDetailOverviewProps) => {
  const { t } = useLanguage();
  const isPositive = portfolio.totalPnL >= 0;

  const stats = [
    {
      title: t('totalValue'),
      value: formatCurrency(portfolio.totalValue, 'SAR'),
      icon: Wallet,
      color: 'blue'
    },
    {
      title: t('totalPnL'),
      value: formatCurrency(portfolio.totalPnL, 'SAR'),
      percentage: `${portfolio.totalPnLPercentage > 0 ? '+' : ''}${portfolio.totalPnLPercentage.toFixed(2)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'green' : 'red'
    },
    {
      title: t('holdings'),
      value: portfolio.holdings.length.toString(),
      icon: Target,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {portfolio.name}
        </h1>
        {portfolio.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {portfolio.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                {stat.percentage && (
                  <p className={`text-sm mt-1 ${
                    stat.color === 'green' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.percentage}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${
                stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                stat.color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                'bg-purple-100 dark:bg-purple-900'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
