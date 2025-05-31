
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewMarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated?: string;
  exchange_code: string;
}

export const useNewMarketData = () => {
  const [markets, setMarkets] = useState<NewMarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      console.log('Fetching market data from new schema...');
      
      // First try to get data from the new schema for market indices
      const { data: newData, error: newError } = await supabase
        .from('symbols')
        .select(`
          symbol,
          name,
          currency,
          exchanges!inner (
            code,
            name
          ),
          symbol_prices!inner (
            price,
            change_amount,
            change_percentage,
            fetched_at
          )
        `)
        .in('exchanges.code', ['NYSE', 'NASDAQ', 'TADAWUL', 'LSE'])
        .eq('is_active', true)
        .order('fetched_at', { foreignTable: 'symbol_prices', ascending: false })
        .limit(1, { foreignTable: 'symbol_prices' });

      if (!newError && newData && newData.length > 0) {
        console.log('Found market data in new schema:', newData.length);
        
        const marketData: NewMarketData[] = newData.map((item: any) => {
          const latestPrice = item.symbol_prices[0];
          return {
            symbol: item.symbol,
            name: item.name,
            price: Number(latestPrice.price) || 0,
            change: Number(latestPrice.change_amount) || 0,
            changePercent: Number(latestPrice.change_percentage) || 0,
            currency: item.currency || 'USD',
            lastUpdated: latestPrice.fetched_at,
            exchange_code: item.exchanges.code
          };
        });

        setMarkets(marketData);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      console.log('No market data in new schema, falling back to indices_data...');
      
      // Fallback to old indices_data table
      const { data, error } = await supabase
        .from('indices_data')
        .select('symbol, name, price, change_amount, change_percentage, currency, last_updated')
        .eq('is_active', true)
        .order('symbol');

      if (error) {
        console.error('Error fetching market data:', error);
        throw error;
      }

      console.log('Raw data from indices_data:', data);

      if (!data || data.length === 0) {
        console.log('No market data found in indices_data');
        setMarkets([]);
        setLastUpdated(new Date());
        return;
      }

      const marketData: NewMarketData[] = data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: Number(item.price) || 0,
        change: Number(item.change_amount) || 0,
        changePercent: Number(item.change_percentage) || 0,
        currency: item.currency || 'USD',
        lastUpdated: item.last_updated,
        exchange_code: 'INDEX' // Default for indices
      }));

      console.log('Processed market data:', marketData);
      setMarkets(marketData);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch market data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes
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
