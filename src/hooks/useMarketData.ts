
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

      const marketData: MarketData[] = data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: Number(item.price),
        change: Number(item.change_amount),
        changePercent: Number(item.change_percentage),
        currency: item.currency,
        lastUpdated: item.last_updated
      }));

      setMarkets(marketData);
      setLastUpdated(new Date());
      console.log('Market data fetched successfully:', marketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch market data from database',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 10 minutes (since data comes from DB, we can refresh more frequently)
    const interval = setInterval(fetchMarketData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    markets,
    loading,
    lastUpdated,
    refreshMarketData: fetchMarketData
  };
};
