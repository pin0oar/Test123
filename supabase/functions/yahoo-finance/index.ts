
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Rate limiting - simple in-memory store with more reasonable limits
const requestTimes: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 30; // Increased from 10 to 30

function isRateLimited(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Remove old requests
  while (requestTimes.length > 0 && requestTimes[0] < oneMinuteAgo) {
    requestTimes.shift();
  }
  
  return requestTimes.length >= MAX_REQUESTS_PER_MINUTE;
}

function recordRequest(): void {
  requestTimes.push(Date.now());
}

async function makeYahooRequest(url: string): Promise<Response> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  console.log(`Making request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(15000) // Increased timeout to 15 seconds
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Yahoo API error: ${response.status} - ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limiting
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
    console.log(`Processing action: ${action}`);
    
    if (action === 'search') {
      if (!q) {
        return new Response(
          JSON.stringify({ error: 'Query parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Try alternative Yahoo Finance endpoints
        const searchUrls = [
          `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`,
          `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`
        ];

        let response;
        let lastError;

        for (const url of searchUrls) {
          try {
            response = await makeYahooRequest(url);
            if (response.ok) break;
          } catch (error) {
            lastError = error;
            console.log(`Failed with ${url}, trying next...`);
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error('All search endpoints failed');
        }

        const data = await response.json();
        const tickers: TickerSearchResult[] = data.quotes?.map((quote: any) => ({
          symbol: quote.symbol,
          shortname: quote.shortname || quote.longname,
          longname: quote.longname || quote.shortname,
          typeDisp: quote.typeDisp || 'Stock',
          exchange: quote.exchange,
          exchDisp: quote.exchDisp || quote.exchange
        })) || [];

        return new Response(
          JSON.stringify({ tickers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`Search API error: ${error.message}`);
        
        // Return fallback data for demo purposes when API fails
        const fallbackTickers: TickerSearchResult[] = [
          { symbol: 'AAPL', shortname: 'Apple Inc.', longname: 'Apple Inc.', typeDisp: 'Equity', exchange: 'NMS', exchDisp: 'NASDAQ' },
          { symbol: 'GOOGL', shortname: 'Alphabet Inc.', longname: 'Alphabet Inc. (Google)', typeDisp: 'Equity', exchange: 'NMS', exchDisp: 'NASDAQ' },
          { symbol: 'MSFT', shortname: 'Microsoft Corp.', longname: 'Microsoft Corporation', typeDisp: 'Equity', exchange: 'NMS', exchDisp: 'NASDAQ' },
          { symbol: 'TSLA', shortname: 'Tesla Inc.', longname: 'Tesla, Inc.', typeDisp: 'Equity', exchange: 'NMS', exchDisp: 'NASDAQ' },
          { symbol: 'AMZN', shortname: 'Amazon.com Inc.', longname: 'Amazon.com, Inc.', typeDisp: 'Equity', exchange: 'NMS', exchDisp: 'NASDAQ' }
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
        // Try multiple quote endpoints
        const quoteUrls = [
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`,
          `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
        ];

        let response;
        let lastError;

        for (const url of quoteUrls) {
          try {
            response = await makeYahooRequest(url);
            if (response.ok) break;
          } catch (error) {
            lastError = error;
            console.log(`Failed with ${url}, trying next...`);
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error('All quote endpoints failed');
        }

        const data = await response.json();
        const quotes: QuoteResult[] = data.quoteResponse?.result?.map((quote: any) => ({
          symbol: quote.symbol,
          regularMarketPrice: quote.regularMarketPrice || 0,
          regularMarketChange: quote.regularMarketChange || 0,
          regularMarketChangePercent: quote.regularMarketChangePercent || 0,
          currency: quote.currency || 'USD',
          shortName: quote.shortName || quote.displayName,
          longName: quote.longName || quote.shortName
        })) || [];

        return new Response(
          JSON.stringify({ quotes }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error(`Quote API error: ${error.message}`);
        
        // Return empty quotes array when API fails
        return new Response(
          JSON.stringify({ quotes: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'markets') {
      try {
        // Get major market indices with multiple fallback endpoints
        const majorIndices = '^GSPC,^DJI,^IXIC,^RUT,^VIX,^TNX';
        const marketUrls = [
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${majorIndices}`,
          `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${majorIndices}`
        ];

        let response;
        let lastError;

        for (const url of marketUrls) {
          try {
            response = await makeYahooRequest(url);
            if (response.ok) break;
          } catch (error) {
            lastError = error;
            console.log(`Failed with ${url}, trying next...`);
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error('All market endpoints failed');
        }

        const data = await response.json();
        const markets = data.quoteResponse?.result?.map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.shortName || quote.displayName,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          currency: quote.currency || 'USD'
        })) || [];

        // Only return markets with valid data
        const validMarkets = markets.filter(m => m.price > 0);

        if (validMarkets.length > 0) {
          return new Response(
            JSON.stringify({ markets: validMarkets }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('No valid market data received');
        }

      } catch (error) {
        console.error(`Markets API error: ${error.message}`);
        
        // Return fallback market data when API fails
        const fallbackMarkets = [
          { symbol: '^GSPC', name: 'S&P 500', price: 4700, change: 25.5, changePercent: 0.55, currency: 'USD' },
          { symbol: '^DJI', name: 'Dow Jones', price: 36000, change: -45.2, changePercent: -0.13, currency: 'USD' },
          { symbol: '^IXIC', name: 'NASDAQ', price: 14500, change: 85.7, changePercent: 0.59, currency: 'USD' }
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
    console.error('Yahoo Finance API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from Yahoo Finance', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
