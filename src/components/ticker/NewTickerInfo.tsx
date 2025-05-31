
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface NewTickerData {
  symbol: string;
  name: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  currency: string;
  last_updated: string;
  market?: string;
  exchange_code?: string;
  volume?: number;
  market_cap?: number;
  dividend_yield?: number;
}

interface NewTickerInfoProps {
  tickerData: NewTickerData;
}

export const NewTickerInfo = ({ tickerData }: NewTickerInfoProps) => {
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

        {tickerData.exchange_code && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Exchange
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {tickerData.exchange_code}
            </p>
            {tickerData.market && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tickerData.market}
              </p>
            )}
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

        {tickerData.volume && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Volume
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {tickerData.volume.toLocaleString()}
            </p>
          </div>
        )}

        {tickerData.market_cap && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Market Cap
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(tickerData.market_cap, tickerData.currency)}
            </p>
          </div>
        )}

        {tickerData.dividend_yield && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Dividend Yield
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {tickerData.dividend_yield.toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
