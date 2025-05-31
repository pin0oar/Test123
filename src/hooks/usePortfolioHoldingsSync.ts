
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePortfolioHoldingsSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncMissingSymbols = async () => {
    try {
      setSyncing(true);
      console.log('Checking for holdings with missing symbols...');

      // Find holdings that have no symbol_id reference
      const { data: holdingsWithMissingSymbols, error: holdingsError } = await supabase
        .from('holdings')
        .select(`
          id,
          symbol,
          name,
          market,
          currency,
          symbol_id
        `)
        .is('symbol_id', null);

      if (holdingsError) throw holdingsError;

      if (!holdingsWithMissingSymbols || holdingsWithMissingSymbols.length === 0) {
        console.log('No holdings with missing symbols found');
        return 0;
      }

      let addedCount = 0;

      for (const holding of holdingsWithMissingSymbols) {
        console.log(`Processing holding with missing symbol_id: ${holding.symbol}`);
        
        // Check if symbol exists in symbols table
        const { data: existingSymbol, error: symbolError } = await supabase
          .from('symbols')
          .select('id')
          .eq('symbol', holding.symbol.toUpperCase())
          .maybeSingle();

        if (symbolError && !symbolError.message.includes('No rows found')) {
          console.error('Error checking symbol:', symbolError);
          continue;
        }

        if (existingSymbol) {
          // Update the holding with the existing symbol_id
          const { error: updateError } = await supabase
            .from('holdings')
            .update({ symbol_id: existingSymbol.id })
            .eq('id', holding.id);
            
          if (updateError) {
            console.error(`Failed to update holding ${holding.id}:`, updateError);
            continue;
          }
          
          addedCount++;
          console.log(`Updated holding ${holding.id} with symbol_id ${existingSymbol.id}`);
        } else {
          // Create the symbol first
          console.log(`Creating missing symbol: ${holding.symbol}`);
          
          try {
            // Determine exchange based on market or currency
            let exchangeCode = 'NYSE'; // default
            if (holding.market === 'TADAWUL' || holding.currency === 'SAR') {
              exchangeCode = 'TADAWUL';
            } else if (holding.market === 'LSE' || holding.currency === 'GBP') {
              exchangeCode = 'LSE';
            }

            // Get or create exchange
            const { data: exchange, error: exchangeError } = await supabase
              .from('exchanges')
              .select('id')
              .eq('code', exchangeCode)
              .maybeSingle();

            if (exchangeError && !exchangeError.message.includes('No rows found')) {
              throw exchangeError;
            }

            let exchangeId = exchange?.id;

            if (!exchange) {
              // Create exchange if it doesn't exist
              const { data: newExchange, error: createError } = await supabase
                .from('exchanges')
                .insert([{
                  code: exchangeCode,
                  name: exchangeCode,
                  country: exchangeCode === 'TADAWUL' ? 'SA' : exchangeCode === 'LSE' ? 'GB' : 'US',
                  currency: holding.currency || 'USD',
                  timezone: exchangeCode === 'TADAWUL' ? 'Asia/Riyadh' : exchangeCode === 'LSE' ? 'Europe/London' : 'America/New_York'
                }])
                .select('id')
                .single();

              if (createError) throw createError;
              exchangeId = newExchange.id;
            }

            // Add the symbol
            const { data: newSymbol, error: insertError } = await supabase
              .from('symbols')
              .insert([{
                symbol: holding.symbol.toUpperCase(),
                name: holding.name,
                exchange_id: exchangeId,
                currency: holding.currency || 'USD',
                is_in_portfolio: true,
                is_active: true
              }])
              .select('id')
              .single();

            if (insertError) throw insertError;

            // Update the holding with the new symbol_id
            const { error: updateError } = await supabase
              .from('holdings')
              .update({ symbol_id: newSymbol.id })
              .eq('id', holding.id);
              
            if (updateError) throw updateError;

            addedCount++;
            console.log(`Successfully created symbol and updated holding: ${holding.symbol}`);
          } catch (error) {
            console.error(`Failed to create symbol ${holding.symbol}:`, error);
          }
        }
      }

      if (addedCount > 0) {
        toast({
          title: 'Symbols Synced',
          description: `Updated ${addedCount} holdings with proper symbol references`,
        });
      }

      console.log(`Sync complete. Updated ${addedCount} holdings.`);
      return addedCount;

    } catch (error) {
      console.error('Error syncing missing symbols:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync missing symbols',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncMissingSymbols,
    syncing
  };
};
