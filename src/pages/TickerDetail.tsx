
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { useTickerData } from '@/hooks/useTickerData';
import { TickerHeader } from '@/components/ticker/TickerHeader';
import { TickerInfo } from '@/components/ticker/TickerInfo';
import { TradingViewWidget } from '@/components/ticker/TradingViewWidget';
import { TickerLoading } from '@/components/ticker/TickerLoading';
import { TickerNotFound } from '@/components/ticker/TickerNotFound';

const TickerDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { tickerData, loading } = useTickerData(symbol);

  if (loading) {
    return <TickerLoading />;
  }

  if (!tickerData) {
    return <TickerNotFound symbol={symbol} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <TickerHeader symbol={tickerData.symbol} name={tickerData.name} />
        <TickerInfo tickerData={tickerData} />
        <TradingViewWidget symbol={tickerData.symbol} />

        {/* Placeholder for future features */}
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
};

export default TickerDetail;
