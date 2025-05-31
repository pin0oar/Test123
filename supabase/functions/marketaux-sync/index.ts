
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled MarketAux sync...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const marketauxApiKey = Deno.env.get('MARKETAUX_API_KEY');

    if (!marketauxApiKey) {
      throw new Error('MARKETAUX_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get symbols that need price updates
    const { data: symbolsToUpdate, error: symbolsError } = await supabase
      .rpc('get_symbols_for_price_update');

    if (symbolsError) {
      console.error('Error getting symbols for update:', symbolsError);
      throw symbolsError;
    }

    if (!symbolsToUpdate || symbolsToUpdate.length === 0) {
      console.log('No symbols found that need price updates');
      return new Response(
        JSON.stringify({ message: 'No symbols need updates', updated: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${symbolsToUpdate.length} symbols to update`);

    // Batch symbols (MarketAux allows up to 100 symbols per request)
    const batchSize = 50; // Conservative batch size
    const batches = [];
    for (let i = 0; i < symbolsToUpdate.length; i += batchSize) {
      batches.push(symbolsToUpdate.slice(i, i + batchSize));
    }

    let totalUpdated = 0;

    for (const batch of batches) {
      try {
        const symbolList = batch.map(s => s.symbol).join(',');
        
        // Call MarketAux API
        const apiUrl = new URL('https://api.marketaux.com/v1/quotes');
        apiUrl.searchParams.set('api_token', marketauxApiKey);
        apiUrl.searchParams.set('symbols', symbolList);

        console.log(`Fetching data for batch: ${symbolList}`);

        const response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MarketAux API error for batch: ${response.status} - ${errorText}`);
          continue; // Skip this batch but continue with others
        }

        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          console.log('No market data received for this batch');
          continue;
        }

        // Prepare updates
        const updates = [];
        
        for (const quote of data.data) {
          const symbolInfo = batch.find(s => s.symbol === quote.symbol);
          
          if (symbolInfo) {
            updates.push({
              symbol_id: symbolInfo.symbol_id,
              price: quote.price,
              change_amount: quote.change,
              change_percentage: quote.change_percent,
              data_source: 'marketaux',
              market_session: 'regular',
              fetched_at: new Date().toISOString()
            });
          }
        }

        if (updates.length > 0) {
          // Upsert price data
          const { error: upsertError } = await supabase
            .from('symbol_prices')
            .upsert(updates, { 
              onConflict: 'symbol_id',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            console.error('Error upserting price data:', upsertError);
          } else {
            totalUpdated += updates.length;
            console.log(`Successfully updated ${updates.length} symbols in this batch`);
          }
        }

        // Add delay between batches to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Error processing batch:', error);
        // Continue with next batch
      }
    }

    console.log(`Sync complete. Updated ${totalUpdated} symbols total.`);

    return new Response(
      JSON.stringify({ 
        message: 'Sync completed successfully', 
        updated: totalUpdated,
        total_symbols: symbolsToUpdate.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('MarketAux sync error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        updated: 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
