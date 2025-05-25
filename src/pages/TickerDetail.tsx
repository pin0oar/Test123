
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useTickerData } from '@/hooks/useTickerData';
import { TickerHeader } from '@/components/ticker/TickerHeader';
import { TickerInfo } from '@/components/ticker/TickerInfo';
import { TradingViewWidget } from '@/components/ticker/TradingViewWidget';
import { SymbolInfoWidget } from '@/components/ticker/SymbolInfoWidget';
import { TechnicalAnalysisWidget } from '@/components/ticker/TechnicalAnalysisWidget';
import { SymbolProfileWidget } from '@/components/ticker/SymbolProfileWidget';
import { TimelineWidget } from '@/components/ticker/TimelineWidget';
import { TickerLoading } from '@/components/ticker/TickerLoading';

const TickerDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { tickerData, loading } = useTickerData(symbol);

  if (loading) {
    return <TickerLoading />;
  }

  // If no ticker data but we have a symbol, show basic layout with TradingView widgets
  if (!tickerData && symbol) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {symbol.toUpperCase()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stock Information
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Symbol Info Widget */}
            <SymbolInfoWidget symbol={symbol.toUpperCase()} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Chart */}
              <TradingViewWidget symbol={symbol.toUpperCase()} />
              
              {/* Technical Analysis */}
              <TechnicalAnalysisWidget symbol={symbol.toUpperCase()} />
            </div>

            {/* Bottom Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Profile */}
              <SymbolProfileWidget symbol={symbol.toUpperCase()} />
              
              {/* News Timeline */}
              <TimelineWidget symbol={symbol.toUpperCase()} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If we have ticker data, show the full layout
  if (tickerData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          <TickerHeader symbol={tickerData.symbol} name={tickerData.name} />
          <div className="mb-6">
            <TickerInfo tickerData={tickerData} />
          </div>
          
          <div className="space-y-6">
            {/* Symbol Info Widget */}
            <SymbolInfoWidget symbol={tickerData.symbol} market={tickerData.market} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Chart */}
              <TradingViewWidget symbol={tickerData.symbol} market={tickerData.market} />
              
              {/* Technical Analysis */}
              <TechnicalAnalysisWidget symbol={tickerData.symbol} market={tickerData.market} />
            </div>

            {/* Bottom Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Profile */}
              <SymbolProfileWidget symbol={tickerData.symbol} market={tickerData.market} />
              
              {/* News Timeline */}
              <TimelineWidget symbol={tickerData.symbol} market={tickerData.market} />
            </div>
          </div>
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
