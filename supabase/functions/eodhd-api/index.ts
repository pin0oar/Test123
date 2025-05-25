
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EODHDQuote {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

interface EODHDSearchResult {
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type: string;
  Isin: string;
}

// Rate limiting
const requestTimes: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 20;

function isRateLimited(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  while (requestTimes.length > 0 && requestTimes[0] < oneMinuteAgo) {
    requestTimes.shift();
  }
  
  return requestTimes.length >= MAX_REQUESTS_PER_MINUTE;
}

function recordRequest(): void {
  requestTimes.push(Date.now());
}

async function makeEODHDRequest(endpoint: string): Promise<Response> {
  const apiKey = Deno.env.get('EODHD_API_KEY');
  if (!apiKey) {
    throw new Error('EODHD API key not configured');
  }

  const url = `https://eodhistoricaldata.com/api/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_token=${apiKey}&fmt=json`;
  
  console.log(`Making EODHD request to: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Lovable-Portfolio-App/1.0',
      },
      signal: AbortSignal.timeout(15000)
    });

    console.log(`EODHD response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`EODHD API error: ${response.status} - ${errorText}`);
      throw new Error(`EODHD API error: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`EODHD request failed: ${error.message}`);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (isRateLimited()) {
      console.log('Rate limited - too many requests');
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    recordRequest();
    
    const { action, q, symbols } = await req.json();
    console.log(`Processing EODHD action: ${action}`);
    
    if (action === 'search') {
      if (!q) {
        return new Response(
          JSON.stringify({ error: 'Query parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const response = await makeEODHDRequest(`search/${encodeURIComponent(q)}`);
        const data: EODHDSearchResult[] = await response.json();
        
        const tickers = data.slice(0, 10).map(item => ({
          symbol: item.Code,
          shortname: item.Name,
          longname: item.Name,
          typeDisp: item.Type,
          exchange: item.Exchange,
          exchDisp: item.Exchange
        }));

        return new Response(
          JSON.stringify({ tickers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`EODHD search error: ${error.message}`);
        
        // Return fallback data when API fails
        const fallbackTickers = [
          { symbol: 'AAPL.US', shortname: 'Apple Inc.', longname: 'Apple Inc.', typeDisp: 'Common Stock', exchange: 'NASDAQ', exchDisp: 'NASDAQ' },
          { symbol: 'GOOGL.US', shortname: 'Alphabet Inc.', longname: 'Alphabet Inc. (Google)', typeDisp: 'Common Stock', exchange: 'NASDAQ', exchDisp: 'NASDAQ' },
          { symbol: 'MSFT.US', shortname: 'Microsoft Corp.', longname: 'Microsoft Corporation', typeDisp: 'Common Stock', exchange: 'NASDAQ', exchDisp: 'NASDAQ' }
        ].filter(ticker => 
          ticker.symbol.toLowerCase().includes(q.toLowerCase()) || 
          ticker.shortname.toLowerCase().includes(q.toLowerCase())
        );

        return new Response(
          JSON.stringify({ tickers: fallbackTickers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'quote') {
      if (!symbols) {
        return new Response(
          JSON.stringify({ error: 'Symbols parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const symbolArray = symbols.split(',');
        const quotes = [];

        for (const symbol of symbolArray) {
          try {
            const response = await makeEODHDRequest(`real-time/${symbol.trim()}`);
            const quote: EODHDQuote = await response.json();
            
            quotes.push({
              symbol: quote.code,
              regularMarketPrice: quote.close || 0,
              regularMarketChange: quote.change || 0,
              regularMarketChangePercent: quote.change_p || 0,
              currency: 'USD', // EODHD doesn't always provide currency in real-time data
              shortName: symbol,
              longName: symbol
            });
          } catch (error) {
            console.error(`Failed to fetch quote for ${symbol}: ${error.message}`);
          }
        }

        return new Response(
          JSON.stringify({ quotes }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`EODHD quote error: ${error.message}`);
        return new Response(
          JSON.stringify({ quotes: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'markets') {
      try {
        // Major market indices with EODHD symbols
        const majorIndices = [
          { symbol: 'GSPC.INDX', name: 'S&P 500' },
          { symbol: 'DJI.INDX', name: 'Dow Jones' },
          { symbol: 'IXIC.INDX', name: 'NASDAQ' },
          { symbol: 'FTSE.INDX', name: 'FTSE 100' },
          { symbol: 'GDAXI.INDX', name: 'DAX' },
          { symbol: 'TASI.INDX', name: 'TASI' }
        ];

        const markets = [];

        for (const index of majorIndices) {
          try {
            const response = await makeEODHDRequest(`real-time/${index.symbol}`);
            const quote: EODHDQuote = await response.json();
            
            if (quote.close && quote.close > 0) {
              markets.push({
                symbol: index.symbol.replace('.INDX', ''),
                name: index.name,
                price: quote.close,
                change: quote.change || 0,
                changePercent: quote.change_p || 0,
                currency: 'USD'
              });
            }
          } catch (error) {
            console.error(`Failed to fetch ${index.symbol}: ${error.message}`);
          }
        }

        if (markets.length > 0) {
          return new Response(
            JSON.stringify({ markets }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No valid market data received');
        }

      } catch (error) {
        console.error(`EODHD markets error: ${error.message}`);
        
        // Return fallback market data
        const fallbackMarkets = [
          { symbol: 'GSPC', name: 'S&P 500', price: 4700, change: 25.5, changePercent: 0.55, currency: 'USD' },
          { symbol: 'DJI', name: 'Dow Jones', price: 36000, change: -45.2, changePercent: -0.13, currency: 'USD' },
          { symbol: 'IXIC', name: 'NASDAQ', price: 14500, change: 85.7, changePercent: 0.59, currency: 'USD' }
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
    console.error('EODHD API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from EODHD', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
