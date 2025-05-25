
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
        
        // First, try to get the ticker from tickers_data (with price information)
        const { data: priceData, error: priceError } = await supabase
          .from('tickers_data')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .eq('is_active', true)
          .single();

        if (!priceError && priceData) {
          console.log('Found ticker in tickers_data:', priceData);
          setTickerData({
            symbol: priceData.symbol,
            name: priceData.name,
            price: Number(priceData.price),
            change_amount: Number(priceData.change_amount),
            change_percentage: Number(priceData.change_percentage),
            currency: priceData.currency,
            last_updated: priceData.last_updated,
            market: priceData.market
          });
          return;
        }

        // If not found in tickers_data, check tracked_tickers for market information
        console.log('Ticker not found in tickers_data, checking tracked_tickers...');
        const { data: trackedData, error: trackedError } = await supabase
          .from('tracked_tickers')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .eq('is_active', true)
          .single();

        if (!trackedError && trackedData) {
          console.log('Found ticker in tracked_tickers:', trackedData);
          // Return basic ticker info from tracked_tickers without price data
          setTickerData({
            symbol: trackedData.symbol,
            name: trackedData.name,
            price: 0,
            change_amount: 0,
            change_percentage: 0,
            currency: trackedData.currency,
            last_updated: new Date().toISOString(),
            market: trackedData.market
          });
          return;
        }

        console.log('Ticker not found in either table');
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
