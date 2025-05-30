
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

      // Query symbol_prices table through symbols table for the requested symbols
      const { data, error } = await supabase
        .from('symbols')
        .select(`
          symbol,
          name,
          currency,
          symbol_prices (
            price,
            change_amount,
            change_percentage,
            fetched_at
          )
        `)
        .in('symbol', symbols)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching ticker prices:', error);
        throw error;
      }

      console.log('Fetched ticker prices:', data);

      const pricesMap: Record<string, TickerPrice> = {};
      if (data) {
        data.forEach(symbol => {
          // Get the most recent price data
          const latestPrice = symbol.symbol_prices?.[0];
          if (latestPrice) {
            pricesMap[symbol.symbol] = {
              symbol: symbol.symbol,
              price: Number(latestPrice.price),
              change_amount: Number(latestPrice.change_amount),
              change_percentage: Number(latestPrice.change_percentage),
              currency: symbol.currency,
              last_updated: latestPrice.fetched_at
            };
          }
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
