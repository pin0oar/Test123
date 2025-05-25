
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  currency: string;
  last_updated: string;
  market?: string;
}

export const useTickerData = (symbol: string | undefined) => {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickerData = async () => {
      if (!symbol) return;
      
      try {
        console.log('Fetching ticker data for:', symbol);
        
        const { data, error } = await supabase
          .from('tickers_data')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching ticker data:', error);
          return;
        }

        if (data) {
          setTickerData({
            symbol: data.symbol,
            name: data.name,
            price: Number(data.price),
            change_amount: Number(data.change_amount),
            change_percentage: Number(data.change_percentage),
            currency: data.currency,
            last_updated: data.last_updated,
            market: data.market
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
  }, [symbol]);

  return { tickerData, loading };
};
