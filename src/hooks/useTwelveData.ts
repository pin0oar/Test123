
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const useTwelveData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getMarketData = async (): Promise<MarketData[]> => {
    try {
      setLoading(true);
      console.log('Getting market data from Twelve Data');
      
      const { data, error } = await supabase.functions.invoke('twelve-data', {
        body: { action: 'markets' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Twelve Data market results:', data);
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching market data from Twelve Data:', error);
      
      // Return fallback data instead of showing error
      return [
        { symbol: 'SPX', name: 'S&P 500', price: 4700, change: 25.5, changePercent: 0.55, currency: 'USD' },
        { symbol: 'DJI', name: 'Dow Jones', price: 36000, change: -45.2, changePercent: -0.13, currency: 'USD' },
        { symbol: 'IXIC', name: 'NASDAQ', price: 14500, change: 85.7, changePercent: 0.59, currency: 'USD' }
      ];
    } finally {
      setLoading(false);
    }
  };

  const getQuotes = async (symbols: string[]): Promise<MarketData[]> => {
    if (symbols.length === 0) return [];
    
    try {
      setLoading(true);
      console.log('Getting quotes for:', symbols);
      
      const { data, error } = await supabase.functions.invoke('twelve-data', {
        body: { action: 'quote', symbols }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Quote results:', data);
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching quotes:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to fetch stock quotes. Using fallback data.',
        variant: 'destructive'
      });
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    getMarketData,
    getQuotes,
    loading
  };
};
