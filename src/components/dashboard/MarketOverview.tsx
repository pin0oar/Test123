
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useMarketData } from '@/hooks/useMarketData';
import { useDataSync } from '@/hooks/useDataSync';
import { TrendingUp, TrendingDown, Database, RefreshCw, Download } from 'lucide-react';

export const MarketOverview = () => {
  const { t } = useLanguage();
  const { markets, loading, lastUpdated, refreshMarketData } = useMarketData();
  const { syncIndicesData, syncing } = useDataSync();

  const handleRefresh = () => {
    refreshMarketData();
  };

  const handleSync = async () => {
    try {
      await syncIndicesData();
      // Refresh the local data after sync
      refreshMarketData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
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
      return date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('marketOverview')}
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">
              Database
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSync}
            disabled={syncing}
            className="h-8 w-8"
            title="Sync from Yahoo Finance"
          >
            <Download className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8"
            title="Refresh from database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {(loading && markets.length === 0) || syncing ? (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {syncing ? 'Syncing from Yahoo Finance...' : 'Loading market data...'}
          </div>
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No market data available
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Click the sync button to fetch data from Yahoo Finance
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={syncing}
            className="mt-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
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
      
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Data from Yahoo Finance
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
