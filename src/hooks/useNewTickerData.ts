
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewTickerData {
  symbol: string;
  name: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  currency: string;
  last_updated: string;
  market?: string;
  exchange_code?: string;
  volume?: number;
  market_cap?: number;
  dividend_yield?: number;
}

export const useNewTickerData = (symbol: string | undefined) => {
  const [tickerData, setTickerData] = useState<NewTickerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickerData = async () => {
      if (!symbol) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching ticker data for:', symbol);
        
        // Query the new symbols table with latest price data
        const { data, error } = await supabase
          .from('symbols')
          .select(`
            symbol,
            name,
            currency,
            exchanges!inner (
              code,
              name
            ),
            symbol_prices (
              price,
              change_amount,
              change_percentage,
              volume,
              market_cap,
              dividend_yield,
              fetched_at
            )
          `)
          .eq('symbol', symbol.toUpperCase())
          .eq('is_active', true)
          .order('fetched_at', { foreignTable: 'symbol_prices', ascending: false })
          .limit(1, { foreignTable: 'symbol_prices' })
          .single();

        if (!error && data) {
          console.log('Found ticker in new schema:', data);
          
          const latestPrice = data.symbol_prices?.[0];
          
          setTickerData({
            symbol: data.symbol,
            name: data.name,
            price: latestPrice ? Number(latestPrice.price) : 0,
            change_amount: latestPrice ? Number(latestPrice.change_amount) : 0,
            change_percentage: latestPrice ? Number(latestPrice.change_percentage) : 0,
            currency: data.currency,
            last_updated: latestPrice ? latestPrice.fetched_at : new Date().toISOString(),
            exchange_code: data.exchanges.code,
            market: data.exchanges.name,
            volume: latestPrice?.volume ? Number(latestPrice.volume) : undefined,
            market_cap: latestPrice?.market_cap ? Number(latestPrice.market_cap) : undefined,
            dividend_yield: latestPrice?.dividend_yield ? Number(latestPrice.dividend_yield) : undefined,
          });
          return;
        }

        console.log('Ticker not found in symbols table');
        setTickerData(null);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        setTickerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
  }, [symbol]);

  return { tickerData, loading };
};
