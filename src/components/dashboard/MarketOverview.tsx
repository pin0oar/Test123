
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useMarketAux } from '@/hooks/useMarketAux';
import { TrendingUp, TrendingDown, Database, RefreshCw, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export const MarketOverview = () => {
  const { t } = useLanguage();
  const { getQuotes, loading } = useMarketAux();
  const [tickers, setTickers] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Sample tickers to test with
  const testSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

  const fetchTickerData = async () => {
    try {
      console.log('Fetching ticker data from MarketAux...');
      const quotes = await getQuotes(testSymbols);
      console.log('Received ticker quotes:', quotes);
      
      // Transform MarketAux data to match the existing format
      const transformedTickers = quotes.map(quote => ({
        symbol: quote.symbol,
        regularMarketPrice: quote.price,
        regularMarketChange: quote.change,
        regularMarketChangePercent: quote.change_percent,
        currency: quote.currency,
        shortName: quote.name,
        longName: quote.name
      }));
      
      setTickers(transformedTickers);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching ticker data:', error);
    }
  };

  useEffect(() => {
    fetchTickerData();
  }, []);

  const handleRefresh = () => {
    fetchTickerData();
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString(undefined, { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      return formatDateTime(date);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Market Overview
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">
              MarketAux
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8"
            title="Refresh ticker data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {loading && tickers.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading ticker data...
          </div>
        </div>
      ) : tickers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No ticker data available
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Click refresh to fetch data from MarketAux
          </div>
          <div className="flex justify-center space-x-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Fetch Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tickers.map((ticker) => {
            const isPositive = ticker.regularMarketChange >= 0;
            
            return (
              <div key={ticker.symbol} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {ticker.symbol}
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${ticker.regularMarketPrice.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ticker.shortName || ticker.longName}
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
                      {isPositive ? '+' : ''}{ticker.regularMarketChangePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-xs ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}${ticker.regularMarketChange.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Data from MarketAux
        </span>
        {lastUpdated && (
          <span>
            Updated: {formatLastUpdated(lastUpdated)}
          </span>
        )}
      </div>
    </Card>
  );
};
