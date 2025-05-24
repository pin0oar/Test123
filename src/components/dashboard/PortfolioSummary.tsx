
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';
import { Portfolio } from '@/types/portfolio';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolios: Portfolio[];
}

export const PortfolioSummary = ({ portfolios }: PortfolioSummaryProps) => {
  const { t } = useLanguage();

  if (portfolios.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('noPortfolios')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('createFirstPortfolio')}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('createPortfolio')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('myPortfolios')}
        </h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('addPortfolio')}
        </Button>
      </div>

      <div className="space-y-4">
        {portfolios.map((portfolio) => {
          const isPositive = portfolio.totalPnL >= 0;
          return (
            <div
              key={portfolio.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {portfolio.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {portfolio.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {portfolio.holdings.length} {t('holdings')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(portfolio.totalValue, 'SAR')}
                </p>
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{portfolio.totalPnLPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
