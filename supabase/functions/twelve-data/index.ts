
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwelveDataQuote {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percent_change: string;
  currency: string;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

// Mapping from our tracked symbols to Twelve Data symbols
const SYMBOL_MAPPING: Record<string, string> = {
  'SPX': 'SPX',
  'IXIC': 'IXIC', 
  'DJI': 'DJI',
  'UKX': 'UKX',
  'DAX': 'DAX',
  'TASI': 'TASI.TADAWUL'
};

async function fetchTwelveDataQuote(symbols: string[], apiKey: string): Promise<MarketData[]> {
  const symbolsParam = symbols.join(',');
  const url = `https://api.twelvedata.com/quote?symbol=${symbolsParam}&apikey=${apiKey}`;
  
  console.log(`Fetching data from Twelve Data: ${url.replace(apiKey, 'HIDDEN')}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000)
    });

    console.log(`Twelve Data response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Twelve Data API error: ${response.status} - ${errorText}`);
      throw new Error(`Twelve Data API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Twelve Data response:', data);

    // Handle both single quote and multiple quotes response formats
    let quotes: TwelveDataQuote[] = [];
    
    if (data.code && data.message) {
      throw new Error(`Twelve Data API error: ${data.message}`);
    }
    
    if (Array.isArray(data)) {
      quotes = data;
    } else if (data.symbol) {
      // Single quote response
      quotes = [data];
    } else {
      // Multiple quotes response - Twelve Data returns an object with symbol keys
      quotes = Object.values(data).filter((item: any) => item && item.symbol);
    }

    const marketData: MarketData[] = quotes.map((quote: TwelveDataQuote) => ({
      symbol: quote.symbol,
      name: quote.name || quote.symbol,
      price: parseFloat(quote.price) || 0,
      change: parseFloat(quote.change) || 0,
      changePercent: parseFloat(quote.percent_change) || 0,
      currency: quote.currency || 'USD'
    })).filter(m => m.price > 0);

    return marketData;
  } catch (error) {
    console.error(`Twelve Data fetch error: ${error.message}`);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not configured');
    }

    const { action, symbols } = await req.json();
    console.log(`Processing Twelve Data action: ${action}`);
    
    if (action === 'quote') {
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Symbols array is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const marketData = await fetchTwelveDataQuote(symbols, apiKey);
      
      return new Response(
        JSON.stringify({ markets: marketData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'markets') {
      // Get major market indices
      const majorIndices = ['SPX', 'DJI', 'IXIC', 'UKX', 'DAX', 'TASI.TADAWUL'];
      
      try {
        const marketData = await fetchTwelveDataQuote(majorIndices, apiKey);
        
        if (marketData.length > 0) {
          return new Response(
            JSON.stringify({ markets: marketData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No valid market data received from Twelve Data');
        }
      } catch (error) {
        console.error(`Twelve Data markets error: ${error.message}`);
        
        // Return fallback market data when API fails
        const fallbackMarkets = [
          { symbol: 'SPX', name: 'S&P 500', price: 4700, change: 25.5, changePercent: 0.55, currency: 'USD' },
          { symbol: 'DJI', name: 'Dow Jones', price: 36000, change: -45.2, changePercent: -0.13, currency: 'USD' },
          { symbol: 'IXIC', name: 'NASDAQ', price: 14500, change: 85.7, changePercent: 0.59, currency: 'USD' },
          { symbol: 'UKX', name: 'FTSE 100', price: 8100, change: 12.3, changePercent: 0.15, currency: 'GBP' },
          { symbol: 'DAX', name: 'DAX', price: 17000, change: -23.1, changePercent: -0.14, currency: 'EUR' },
          { symbol: 'TASI', name: 'TASI', price: 11500, change: 45.2, changePercent: 0.39, currency: 'SAR' }
        ];

        return new Response(
          JSON.stringify({ markets: fallbackMarkets }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Twelve Data API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from Twelve Data', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
