
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
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: null,
        headers: {},
        method: 'GET',
      }, {
        query: new URLSearchParams({
          action: 'search',
          q: query
        })
      });

      if (error) throw error;
      return data.tickers || [];
    } catch (error) {
      console.error('Error searching tickers:', error);
      toast({
        title: 'Error',
        description: 'Failed to search tickers',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getQuotes = async (symbols: string[]): Promise<QuoteResult[]> => {
    if (symbols.length === 0) return [];
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: null,
        headers: {},
        method: 'GET',
      }, {
        query: new URLSearchParams({
          action: 'quote',
          symbols: symbols.join(',')
        })
      });

      if (error) throw error;
      return data.quotes || [];
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stock quotes',
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
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: null,
        headers: {},
        method: 'GET',
      }, {
        query: new URLSearchParams({
          action: 'markets'
        })
      });

      if (error) throw error;
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch market data',
        variant: 'destructive'
      });
      return [];
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
