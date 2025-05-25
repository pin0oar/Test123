
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';
import { Portfolio } from '@/types/portfolio';
import { TrendingUp, TrendingDown, Package } from 'lucide-react';

interface PortfolioHoldingsProps {
  portfolio: Portfolio;
}

export const PortfolioHoldings = ({ portfolio }: PortfolioHoldingsProps) => {
  const { t } = useLanguage();

  if (portfolio.holdings.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('holdings')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No holdings in this portfolio yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('holdings')}
      </h3>
      
      <div className="space-y-4">
        {portfolio.holdings.map((holding) => {
          const isPositive = holding.pnl >= 0;
          return (
            <div
              key={holding.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {holding.symbol.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {holding.symbol}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <Package className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {holding.lotId}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {holding.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {holding.quantity} shares @ {formatCurrency(holding.avgPrice, holding.currency)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(holding.totalValue, holding.currency)}
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
                    {isPositive ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
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
