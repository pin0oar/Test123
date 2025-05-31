
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

      console.log(`MarketAux API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MarketAux API error: ${response.status} - ${errorText}`);
        throw new Error(`MarketAux API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('MarketAux API response data:', JSON.stringify(responseData, null, 2));
      return responseData;
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

        try {
          // Try to use entity search endpoint instead
          const data = await makeMarketAuxRequest('entity/search', {
            search: query,
            limit: '10'
          });

          // Transform the response to match expected format
          const symbols = data.data ? data.data.map((item: any) => ({
            symbol: item.symbol || item.ticker || item.name,
            name: item.name || item.symbol,
            exchange: item.exchange || 'N/A',
            country: item.country || 'N/A',
            currency: 'USD', // Default since MarketAux focuses on sentiment
            type: item.entity_type || 'equity',
            mic_code: item.mic_code
          })) : [];

          return new Response(
            JSON.stringify({ symbols }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Entity search failed, returning empty results:', error);
          return new Response(
            JSON.stringify({ symbols: [] }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
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

        // MarketAux doesn't provide real-time stock prices, so we'll return mock data
        // with a clear indication that this is not real financial data
        console.log('MarketAux does not provide stock price data - returning sentiment-based mock data');
        
        const symbols = symbolsParam.split(',');
        const mockQuotes = symbols.map((symbol: string) => ({
          symbol: symbol.trim(),
          name: `${symbol.trim()} Company`,
          price: 100 + Math.random() * 900, // Mock price between 100-1000
          change: (Math.random() - 0.5) * 20, // Mock change between -10 to +10
          change_percent: (Math.random() - 0.5) * 10, // Mock percentage between -5% to +5%
          currency: 'USD',
          exchange: 'NASDAQ',
          mic_code: 'XNAS',
          last_updated: new Date().toISOString()
        }));

        return new Response(
          JSON.stringify({ 
            quotes: mockQuotes,
            warning: 'MarketAux provides sentiment analysis, not real-time stock prices. This is mock data for demonstration.'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'market-data': {
        // Since MarketAux doesn't provide stock prices, return sentiment data about major indices
        try {
          const majorIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'EFA'];
          
          // Try to get sentiment data for these symbols
          const data = await makeMarketAuxRequest('entity/stats/aggregation', {
            symbols: majorIndices.join(','),
            limit: '10'
          });

          console.log('Received sentiment data:', data);

          // Transform sentiment data to mock price data
          const quotes = data.data ? data.data.map((item: any) => ({
            symbol: item.key,
            name: `${item.key} Index`,
            price: 100 + (item.sentiment_avg || 0) * 1000, // Use sentiment to influence mock price
            change: (item.sentiment_avg || 0) * 10,
            change_percent: (item.sentiment_avg || 0) * 5,
            currency: 'USD',
            exchange: 'INDEX',
            mic_code: 'INDX',
            last_updated: new Date().toISOString(),
            sentiment_avg: item.sentiment_avg,
            total_documents: item.total_documents
          })) : [];

          return new Response(
            JSON.stringify({ 
              quotes,
              note: 'MarketAux provides sentiment analysis. Prices are derived from sentiment scores.',
              sentiment_based: true
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Sentiment aggregation failed, returning mock data:', error);
          
          // Return basic mock data as fallback
          const majorIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'EFA'];
          const mockQuotes = majorIndices.map(symbol => ({
            symbol,
            name: `${symbol} Index`,
            price: 100 + Math.random() * 400,
            change: (Math.random() - 0.5) * 10,
            change_percent: (Math.random() - 0.5) * 3,
            currency: 'USD',
            exchange: 'INDEX',
            mic_code: 'INDX',
            last_updated: new Date().toISOString()
          }));

          return new Response(
            JSON.stringify({ 
              quotes: mockQuotes,
              warning: 'Fallback mock data - MarketAux API unavailable'
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
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
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        note: 'MarketAux specializes in sentiment analysis, not real-time stock prices'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
