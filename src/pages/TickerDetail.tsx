
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { useTickerData } from '@/hooks/useTickerData';
import { TickerHeader } from '@/components/ticker/TickerHeader';
import { TickerInfo } from '@/components/ticker/TickerInfo';
import { TradingViewWidget } from '@/components/ticker/TradingViewWidget';
import { TickerLoading } from '@/components/ticker/TickerLoading';

const TickerDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { tickerData, loading } = useTickerData(symbol);

  if (loading) {
    return <TickerLoading />;
  }

  // If no ticker data but we have a symbol, show basic layout with TradingView widget
  if (!tickerData && symbol) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {symbol.toUpperCase()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stock Information
              </p>
            </div>
          </div>
          
          <TradingViewWidget symbol={symbol.toUpperCase()} />

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed ticker information will be available once data is synced to the database.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  // If we have ticker data, show the full layout
  if (tickerData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          <TickerHeader symbol={tickerData.symbol} name={tickerData.name} />
          <TickerInfo tickerData={tickerData} />
          <TradingViewWidget symbol={tickerData.symbol} />

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              More detailed ticker information and charts coming soon...
            </p>
          </Card>
        </main>
      </div>
    );
  }

  // Fallback if no symbol
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ticker Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No ticker symbol provided
          </p>
        </div>
      </main>
    </div>
  );
};

export default TickerDetail;
