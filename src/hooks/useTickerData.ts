
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
        
        // Fetch ticker from symbols table with latest price data
        const { data: symbolData, error: symbolError } = await supabase
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
            ),
            exchanges (
              code,
              name
            )
          `)
          .eq('symbol', symbol.toUpperCase())
          .eq('is_active', true)
          .single();

        if (!symbolError && symbolData) {
          console.log('Found ticker in symbols table:', symbolData);
          
          const latestPrice = symbolData.symbol_prices?.[0];
          setTickerData({
            symbol: symbolData.symbol,
            name: symbolData.name,
            price: latestPrice ? Number(latestPrice.price) : 0,
            change_amount: latestPrice ? Number(latestPrice.change_amount) : 0,
            change_percentage: latestPrice ? Number(latestPrice.change_percentage) : 0,
            currency: symbolData.currency,
            last_updated: latestPrice ? latestPrice.fetched_at : new Date().toISOString(),
            market: symbolData.exchanges?.name || symbolData.exchanges?.code
          });
          return;
        }

        console.log('Ticker not found in symbols table');
        setTickerData(null);
      } catch (error) {
        console.error('Error:', error);
        setTickerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
  }, [symbol]);

  return { tickerData, loading };
};
