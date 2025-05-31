
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('MARKETAUX_API_KEY');
    if (!apiKey) {
      console.error('MARKETAUX_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'MarketAux API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const action = body.action;
    
    console.log(`MarketAux API request: ${action}`, body);

    const makeMarketAuxRequest = async (endpoint: string, params: Record<string, string> = {}) => {
      const apiUrl = new URL(`https://api.marketaux.com/v1/${endpoint}`);
      apiUrl.searchParams.set('api_token', apiKey);
      
      for (const [key, value] of Object.entries(params)) {
        apiUrl.searchParams.set(key, value);
      }

      console.log(`Making MarketAux request to: ${endpoint} with params:`, params);
      console.log(`Full URL: ${apiUrl.toString()}`);

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MarketAux API error: ${response.status} - ${errorText}`);
        throw new Error(`MarketAux API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    };

    switch (action) {
      case 'search': {
        const query = body.query;
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required for search' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const data = await makeMarketAuxRequest('symbols/search', {
          search: query,
          limit: '10'
        });

        const symbols = data.data.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          exchange: item.exchange,
          country: item.country,
          currency: item.currency,
          type: item.type,
          mic_code: item.mic_code
        }));

        return new Response(
          JSON.stringify({ symbols }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'quotes': {
        const symbolsParam = body.symbols;
        if (!symbolsParam) {
          return new Response(
            JSON.stringify({ error: 'Symbols parameter required for quotes' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Use the correct endpoint for real-time quotes
        const data = await makeMarketAuxRequest('real-time', {
          symbols: symbolsParam
        });

        const quotes = data.data.map((quote: any) => ({
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

        return new Response(
          JSON.stringify({ quotes }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'market-data': {
        // Get major market indices
        const majorIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'EFA'];
        const data = await makeMarketAuxRequest('real-time', {
          symbols: majorIndices.join(',')
        });

        const quotes = data.data.map((quote: any) => ({
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

        return new Response(
          JSON.stringify({ quotes }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action parameter' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('MarketAux API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
