
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

      // Find holdings that reference symbols not in the symbols table
      const { data: holdingsWithMissingSymbols, error: holdingsError } = await supabase
        .from('holdings')
        .select(`
          id,
          symbol,
          name,
          market,
          currency
        `);

      if (holdingsError) throw holdingsError;

      if (!holdingsWithMissingSymbols || holdingsWithMissingSymbols.length === 0) {
        console.log('No holdings found');
        return 0;
      }

      let addedCount = 0;

      for (const holding of holdingsWithMissingSymbols) {
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

        if (!existingSymbol) {
          console.log(`Adding missing symbol: ${holding.symbol}`);
          
          // Try to auto-add the symbol
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
            const { error: insertError } = await supabase
              .from('symbols')
              .insert([{
                symbol: holding.symbol.toUpperCase(),
                name: holding.name,
                exchange_id: exchangeId,
                currency: holding.currency || 'USD',
                is_in_portfolio: true,
                is_active: true
              }]);

            if (insertError) throw insertError;

            addedCount++;
            console.log(`Successfully added symbol: ${holding.symbol}`);
          } catch (error) {
            console.error(`Failed to add symbol ${holding.symbol}:`, error);
          }
        }
      }

      if (addedCount > 0) {
        toast({
          title: 'Symbols Synced',
          description: `Added ${addedCount} missing symbols to the database`,
        });
      }

      console.log(`Sync complete. Added ${addedCount} symbols.`);
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
