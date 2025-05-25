
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TickerPrice {
  symbol: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  currency: string;
  last_updated: string;
}

export const useTickerPrices = (symbols: string[]) => {
  const [tickerPrices, setTickerPrices] = useState<Record<string, TickerPrice>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTickerPrices = async () => {
    if (symbols.length === 0) return;

    try {
      setLoading(true);
      console.log('Fetching ticker prices for:', symbols);

      const { data, error } = await supabase
        .from('tickers_data')
        .select('symbol, price, change_amount, change_percentage, currency, last_updated')
        .in('symbol', symbols)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching ticker prices:', error);
        throw error;
      }

      console.log('Fetched ticker prices:', data);

      const pricesMap: Record<string, TickerPrice> = {};
      if (data) {
        data.forEach(ticker => {
          pricesMap[ticker.symbol] = {
            symbol: ticker.symbol,
            price: Number(ticker.price),
            change_amount: Number(ticker.change_amount),
            change_percentage: Number(ticker.change_percentage),
            currency: ticker.currency,
            last_updated: ticker.last_updated
          };
        });
      }

      setTickerPrices(pricesMap);
    } catch (error) {
      console.error('Error fetching ticker prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch ticker prices from database',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerPrices();
  }, [symbols.join(',')]);

  return {
    tickerPrices,
    loading,
    refetch: fetchTickerPrices
  };
};
