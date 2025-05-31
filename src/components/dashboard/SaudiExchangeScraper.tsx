
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, RefreshCw, Database, AlertTriangle } from 'lucide-react';

export const SaudiExchangeScraper = () => {
  const [loading, setLoading] = useState(false);
  const [lastScrape, setLastScrape] = useState<Date | null>(null);
  const [scrapedData, setScrapedData] = useState<any[]>([]);
  const { toast } = useToast();

  const handleScrape = async () => {
    try {
      setLoading(true);
      console.log('Starting Saudi Exchange scraping...');

      // Call the edge function to scrape Saudi Exchange data
      const { data, error } = await supabase.functions.invoke('saudi-exchange-scraper', {
        body: {}
      });

      if (error) {
        console.error('Error calling scraper function:', error);
        throw error;
      }

      console.log('Scraper response:', data);

      if (data.success) {
        setScrapedData(data.data || []);
        setLastScrape(new Date());
        
        toast({
          title: 'Success',
          description: `Successfully scraped ${data.tickersProcessed} Saudi stocks`,
          duration: 3000,
        });
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error scraping Saudi Exchange:', error);
      toast({
        title: 'Error',
        description: 'Failed to scrape Saudi Exchange data',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Saudi Exchange Scraper
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Database className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-600">
              Tadawul
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleScrape}
            disabled={loading}
            className="h-8"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Scraping...' : 'Scrape Data'}
          </Button>
        </div>
      </div>

      {/* Warning about demo data */}
      <div className="flex items-center space-x-2 mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <span className="text-xs text-orange-600 dark:text-orange-400">
          Demo data: Real scraping requires handling dynamic content and anti-bot measures
        </span>
      </div>

      {/* Display scraped data */}
      {scrapedData.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recently Scraped Saudi Stocks:
          </h4>
          {scrapedData.map((ticker) => (
            <div key={ticker.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                  {ticker.symbol}.SR
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {ticker.name}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {ticker.price.toFixed(2)} SAR
                </p>
                <p className={`text-xs ${
                  ticker.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ticker.change >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Last scrape info */}
      {lastScrape && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span>Last scraped from Tadawul</span>
          <span>{formatDateTime(lastScrape)}</span>
        </div>
      )}
    </Card>
  );
};
