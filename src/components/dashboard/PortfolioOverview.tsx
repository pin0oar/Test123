
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface PortfolioOverviewProps {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  portfolioCount: number;
}

export const PortfolioOverview = ({
  totalValue,
  totalPnL,
  totalPnLPercentage,
  portfolioCount
}: PortfolioOverviewProps) => {
  const { t } = useLanguage();
  const isPositive = totalPnL >= 0;

  const stats = [
    {
      title: t('totalValue'),
      value: formatCurrency(totalValue, 'SAR'),
      icon: Wallet,
      color: 'blue'
    },
    {
      title: t('totalPnL'),
      value: formatCurrency(totalPnL, 'SAR'),
      percentage: `${totalPnLPercentage > 0 ? '+' : ''}${totalPnLPercentage.toFixed(2)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'green' : 'red'
    },
    {
      title: t('portfolios'),
      value: portfolioCount.toString(),
      icon: Target,
      color: 'purple'
    }
  ];

  return (
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
  );
};
