
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Symbol mapping from our tracked symbols to Finnhub symbols
const SYMBOL_MAPPING: Record<string, string> = {
  'SPX': '^GSPC',
  'IXIC': '^IXIC', 
  'DJI': '^DJI',
  'UKX': '^FTSE',
  'DAX': '^GDAXI',
  'TASI': 'TASI.SR'
};

async function makeFinnhubRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const apiKey = Deno.env.get('FINNHUB_API_KEY');
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  const url = new URL(`https://finnhub.io/api/v1/${endpoint}`);
  url.searchParams.set('token', apiKey);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  console.log(`Making Finnhub request to: ${url.toString().replace(apiKey, 'API_KEY_HIDDEN')}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    console.log(`Finnhub response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Finnhub request failed: ${error.message}`);
    throw error;
  }
}

async function searchSymbols(query: string) {
  try {
    const data = await makeFinnhubRequest('search', { q: query });
    
    return {
      tickers: data.result?.map((item: any) => ({
        symbol: item.symbol,
        shortname: item.description,
        longname: item.description,
        typeDisp: item.type,
        exchange: item.exchange || 'US',
        exchDisp: item.exchange || 'US'
      })) || []
    };
  } catch (error) {
    console.error('Finnhub search error:', error);
    return { tickers: [] };
  }
}

async function getQuotes(symbols: string[]) {
  try {
    const quotes = [];
    
    for (const symbol of symbols) {
      try {
        const data = await makeFinnhubRequest('quote', { symbol });
        
        quotes.push({
          symbol: symbol,
          regularMarketPrice: data.c || 0,
          regularMarketChange: (data.c - data.pc) || 0,
          regularMarketChangePercent: data.dp || 0,
          currency: 'USD',
          shortName: symbol,
          longName: symbol
        });
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
      }
    }
    
    return { quotes };
  } catch (error) {
    console.error('Finnhub quotes error:', error);
    return { quotes: [] };
  }
}

async function getMarketData() {
  try {
    const symbols = ['^GSPC', '^DJI', '^IXIC', '^FTSE', '^GDAXI', 'TASI.SR'];
    const markets = [];
    
    for (const symbol of symbols) {
      try {
        const data = await makeFinnhubRequest('quote', { symbol });
        
        // Map back to our internal symbols
        const internalSymbol = Object.keys(SYMBOL_MAPPING).find(key => 
          SYMBOL_MAPPING[key] === symbol
        ) || symbol.replace('^', '');
        
        const name = getMarketName(internalSymbol);
        const currency = getMarketCurrency(internalSymbol);
        
        markets.push({
          symbol: internalSymbol,
          name: name,
          price: data.c || 0,
          change: (data.c - data.pc) || 0,
          changePercent: data.dp || 0,
          currency: currency
        });
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }
    
    return { markets };
  } catch (error) {
    console.error('Finnhub markets error:', error);
    return { markets: [] };
  }
}

function getMarketName(symbol: string): string {
  const names: Record<string, string> = {
    'SPX': 'S&P 500',
    'DJI': 'Dow Jones Industrial Average',
    'IXIC': 'NASDAQ Composite',
    'UKX': 'FTSE 100',
    'DAX': 'DAX Performance Index',
    'TASI': 'Tadawul All Share Index'
  };
  return names[symbol] || symbol;
}

function getMarketCurrency(symbol: string): string {
  const currencies: Record<string, string> = {
    'SPX': 'USD',
    'DJI': 'USD',
    'IXIC': 'USD',
    'UKX': 'GBP',
    'DAX': 'EUR',
    'TASI': 'SAR'
  };
  return currencies[symbol] || 'USD';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, q, symbols } = await req.json();
    console.log(`Processing Finnhub action: ${action}`);

    let result;
    
    switch (action) {
      case 'search':
        result = await searchSymbols(q);
        break;
      case 'quote':
        result = await getQuotes(symbols.split(','));
        break;
      case 'markets':
        result = await getMarketData();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Finnhub API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
