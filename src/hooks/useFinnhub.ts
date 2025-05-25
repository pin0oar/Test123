
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

export const useFinnhub = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchTickers = async (query: string): Promise<TickerSearchResult[]> => {
    try {
      setLoading(true);
      console.log('Searching tickers with Finnhub:', query);

      const { data, error } = await supabase.functions.invoke('finnhub-api', {
        body: { action: 'search', q: query }
      });

      if (error) {
        console.error('Finnhub search error:', error);
        throw error;
      }

      console.log('Finnhub search results:', data);
      return data.tickers || [];
    } catch (error) {
      console.error('Error searching tickers:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search tickers. Please try again.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getQuotes = async (symbols: string[]): Promise<QuoteResult[]> => {
    try {
      setLoading(true);
      console.log('Getting quotes from Finnhub:', symbols);

      const { data, error } = await supabase.functions.invoke('finnhub-api', {
        body: { action: 'quote', symbols: symbols.join(',') }
      });

      if (error) {
        console.error('Finnhub quote error:', error);
        throw error;
      }

      console.log('Finnhub quote results:', data);
      return data.quotes || [];
    } catch (error) {
      console.error('Error getting quotes:', error);
      toast({
        title: 'Quote Error',
        description: 'Failed to get stock quotes. Please try again.',
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
      console.log('Getting market data from Finnhub...');

      const { data, error } = await supabase.functions.invoke('finnhub-api', {
        body: { action: 'markets' }
      });

      if (error) {
        console.error('Finnhub markets error:', error);
        throw error;
      }

      console.log('Finnhub market data:', data);
      return data.markets || [];
    } catch (error) {
      console.error('Error getting market data:', error);
      toast({
        title: 'Market Data Error',
        description: 'Failed to get market data. Please try again.',
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
