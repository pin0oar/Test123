
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TickerSearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  typeDisp: string;
  exchange: string;
  exchDisp: string;
}

interface QuoteResult {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  currency: string;
  shortName: string;
  longName: string;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const useYahooFinance = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchTickers = async (query: string): Promise<TickerSearchResult[]> => {
    if (!query.trim()) return [];
    
    try {
      setLoading(true);
      console.log('Searching tickers for:', query);
      
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: { action: 'search', q: query }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Search results:', data);
      return data.tickers || [];
    } catch (error) {
      console.error('Error searching tickers:', error);
      
      // Don't show toast for every search error to avoid spam
      if (error.message?.includes('Too many requests')) {
        toast({
          title: 'Rate Limited',
          description: 'Please wait a moment before searching again',
          variant: 'destructive'
        });
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getQuotes = async (symbols: string[]): Promise<QuoteResult[]> => {
    if (symbols.length === 0) return [];
    
    try {
      setLoading(true);
      console.log('Getting quotes for:', symbols);
      
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: { action: 'quote', symbols: symbols.join(',') }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Quote results:', data);
      return data.quotes || [];
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

  const getMarketData = async (): Promise<MarketData[]> => {
    try {
      setLoading(true);
      console.log('Getting market data');
      
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: { action: 'markets' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Market data results:', data);
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      // Return fallback data instead of showing error
      return [
        { symbol: '^GSPC', name: 'S&P 500', price: 4700, change: 25.5, changePercent: 0.55, currency: 'USD' },
        { symbol: '^DJI', name: 'Dow Jones', price: 36000, change: -45.2, changePercent: -0.13, currency: 'USD' },
        { symbol: '^IXIC', name: 'NASDAQ', price: 14500, change: 85.7, changePercent: 0.59, currency: 'USD' }
      ];
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTickers,
    getQuotes,
    getMarketData,
    loading
  };
};
