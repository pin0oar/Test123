
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MarketAuxSymbol {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  currency: string;
  type: string;
  mic_code?: string;
}

interface MarketAuxQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  currency: string;
  exchange: string;
  mic_code?: string;
  last_updated: string;
}

export const useMarketAux = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchSymbols = async (query: string): Promise<MarketAuxSymbol[]> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('marketaux-api', {
        body: JSON.stringify({ action: 'search', query })
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.symbols || [];
    } catch (error) {
      console.error('MarketAux search error:', error);
      toast({
        title: 'Search Error',
        description: error instanceof Error ? error.message : 'Failed to search symbols',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getQuotes = async (symbols: string[]): Promise<MarketAuxQuote[]> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('marketaux-api', {
        body: JSON.stringify({ action: 'quotes', symbols: symbols.join(',') })
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.quotes || [];
    } catch (error) {
      console.error('MarketAux quotes error:', error);
      toast({
        title: 'Quote Error',
        description: error instanceof Error ? error.message : 'Failed to fetch quotes',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMarketData = async (): Promise<MarketAuxQuote[]> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('marketaux-api', {
        body: JSON.stringify({ action: 'market-data' })
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.quotes || [];
    } catch (error) {
      console.error('MarketAux market data error:', error);
      toast({
        title: 'Market Data Error',
        description: error instanceof Error ? error.message : 'Failed to fetch market data',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    searchSymbols,
    getQuotes,
    getMarketData,
    loading
  };
};
