
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated?: string;
}

export const useMarketData = () => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      console.log('Fetching market data from database...');
      
      const { data, error } = await supabase
        .from('indices_data')
        .select('symbol, name, price, change_amount, change_percentage, currency, last_updated')
        .eq('is_active', true)
        .order('symbol');

      if (error) {
        console.error('Error fetching market data:', error);
        throw error;
      }

      console.log('Raw data from database:', data);

      if (!data || data.length === 0) {
        console.log('No market data found in database');
        setMarkets([]);
        setLastUpdated(new Date());
        return;
      }

      const marketData: MarketData[] = data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: Number(item.price) || 0,
        change: Number(item.change_amount) || 0,
        changePercent: Number(item.change_percentage) || 0,
        currency: item.currency || 'USD',
        lastUpdated: item.last_updated
      }));

      console.log('Processed market data:', marketData);
      setMarkets(marketData);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch market data from database',
        variant: 'destructive'
      });
      // Don't clear markets on error to maintain existing data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes from database
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    markets,
    loading,
    lastUpdated,
    refreshMarketData: fetchMarketData
  };
};
