
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  currency: string;
  last_updated: string;
  market?: string;
}

interface TickerInfoProps {
  tickerData: TickerData;
}

export const TickerInfo = ({ tickerData }: TickerInfoProps) => {
  const isPositive = tickerData.change_amount >= 0;

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Current Price
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(tickerData.price, tickerData.currency)}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Change
          </h3>
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className={`text-lg font-semibold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? '+' : ''}{formatCurrency(tickerData.change_amount, tickerData.currency)}
              </p>
              <p className={`text-sm ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? '+' : ''}{tickerData.change_percentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {tickerData.market && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Market
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {tickerData.market}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Last Updated
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(tickerData.last_updated).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
};
