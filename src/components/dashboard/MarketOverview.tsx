
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useYahooFinance } from '@/hooks/useYahooFinance';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const MarketOverview = () => {
  const { t } = useLanguage();
  const { getMarketData, loading } = useYahooFinance();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    const fetchMarkets = async () => {
      const marketData = await getMarketData();
      setMarkets(marketData);
      
      // Check if we got real data or fallback data
      // If we get exactly 3 items with specific values, it's likely fallback data
      const isFallback = marketData.length === 3 && 
        marketData.some(m => m.symbol === '^GSPC' && m.price === 4700);
      
      setIsLiveData(!isFallback);
    };

    fetchMarkets();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarkets, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getMarketData]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('marketOverview')}
        </h3>
        
        <div className="flex items-center space-x-1">
          {isLiveData ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <span className={`text-xs font-medium ${
            isLiveData ? 'text-green-600' : 'text-orange-600'
          }`}>
            {isLiveData ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>
      
      {loading && markets.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading market data...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {markets.map((market) => {
            const isPositive = market.change >= 0;
            return (
              <div key={market.symbol} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {market.name}
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {market.price.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
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
                      {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-xs ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{market.change.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        {isLiveData ? 'Data provided by Yahoo Finance' : 'Demo data - Yahoo Finance unavailable'} • Updated every 5 minutes
      </p>
    </Card>
  );
};
