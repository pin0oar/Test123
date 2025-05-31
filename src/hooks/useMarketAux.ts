
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface MarketAuxSearchResult {
  data: MarketAuxSymbol[];
  meta: {
    found: number;
    returned: number;
  };
}

interface MarketAuxQuoteResult {
  data: MarketAuxQuote[];
  meta: {
    found: number;
    returned: number;
  };
}

export const useMarketAux = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const makeMarketAuxRequest = async (endpoint: string, params: Record<string, string> = {}) => {
    const apiKey = import.meta.env.VITE_MARKETAUX_API_KEY;
    if (!apiKey) {
      throw new Error('MarketAux API key not configured. Please set VITE_MARKETAUX_API_KEY in your environment.');
    }

    const url = new URL(`https://api.marketaux.com/v1/${endpoint}`);
    url.searchParams.set('api_token', apiKey);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    console.log(`Making MarketAux request to: ${url.toString().replace(apiKey, 'API_KEY_HIDDEN')}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MarketAux API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MarketAux request failed: ${error.message}`);
      throw error;
    }
  };

  const searchSymbols = async (query: string): Promise<MarketAuxSymbol[]> => {
    try {
      setLoading(true);
      const data: MarketAuxSearchResult = await makeMarketAuxRequest('symbols/search', {
        search: query,
        limit: '10'
      });

      return data.data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchange,
        country: item.country,
        currency: item.currency,
        type: item.type,
        mic_code: item.mic_code
      }));
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
      const symbolsParam = symbols.join(',');
      const data: MarketAuxQuoteResult = await makeMarketAuxRequest('quotes', {
        symbols: symbolsParam
      });

      return data.data.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        change_percent: quote.change_percent,
        currency: quote.currency,
        exchange: quote.exchange,
        mic_code: quote.mic_code,
        last_updated: quote.last_updated
      }));
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
      // Get major market indices
      const majorIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'EFA'];
      return await getQuotes(majorIndices);
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
