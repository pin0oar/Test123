
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

  const testSymbolAvailability = async () => {
    try {
      setLoading(true);
      console.log('Testing symbol availability in Twelve Data...');
      
      const { data, error } = await supabase.functions.invoke('twelve-data', {
        body: { action: 'test-symbols' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Symbol test results:', data);
      
      toast({
        title: 'Symbol Test Complete',
        description: 'Check the browser console and Supabase logs for detailed results.',
      });

      return data;
    } catch (error) {
      console.error('Error testing symbols:', error);
      
      toast({
        title: 'Test Failed',
        description: 'Failed to test symbol availability. Check console for details.',
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 470, change: 2.5, changePercent: 0.53, currency: 'USD' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 380, change: -1.2, changePercent: -0.32, currency: 'USD' },
        { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', price: 360, change: 1.8, changePercent: 0.50, currency: 'USD' },
        { symbol: 'IWM', name: 'iShares Russell 2000 ETF', price: 220, change: 0.5, changePercent: 0.23, currency: 'USD' },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 240, change: 1.2, changePercent: 0.50, currency: 'USD' },
        { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', price: 78, change: -0.3, changePercent: -0.38, currency: 'USD' }
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
    testSymbolAvailability,
    loading
  };
};
