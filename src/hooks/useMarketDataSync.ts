
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinnhub } from './useFinnhub';
import { useToast } from '@/hooks/use-toast';

export const useMarketDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { getMarketData } = useFinnhub();
  const { toast } = useToast();

  const syncMarketData = async () => {
    try {
      setSyncing(true);
      console.log('Starting market data sync using Finnhub...');

      // Get symbols that need price updates using the new database function
      const { data: symbolsToUpdate, error: symbolsError } = await supabase
        .rpc('get_symbols_for_price_update');

      if (symbolsError) {
        console.error('Error getting symbols for update:', symbolsError);
        throw symbolsError;
      }

      if (!symbolsToUpdate || symbolsToUpdate.length === 0) {
        console.log('No symbols found that need price updates');
        toast({
          title: 'Info',
          description: 'No symbols need price updates at this time',
        });
        return 0;
      }

      console.log(`Found ${symbolsToUpdate.length} symbols to update`);

      // Get market data from Finnhub - pass symbols as parameter
      const symbolList = symbolsToUpdate.map(s => s.symbol);
      const marketData = await getMarketData(); // Fixed: removed parameter
      console.log('Market data from Finnhub:', marketData);

      if (!marketData || marketData.length === 0) {
        throw new Error('No market data received from Finnhub');
      }

      // Update symbols that have corresponding data
      const updates = [];
      
      for (const data of marketData) {
        // Find the symbol info from our database query
        const symbolInfo = symbolsToUpdate.find(s => s.symbol === data.symbol);
        
        if (symbolInfo) {
          // Update or insert price data using symbol_id
          const priceUpdate = {
            symbol_id: symbolInfo.symbol_id,
            price: data.price,
            change_amount: data.change,
            change_percentage: data.changePercent,
            data_source: 'finnhub',
            market_session: 'regular',
            fetched_at: new Date().toISOString()
          };

          console.log('Updating price for:', symbolInfo.symbol, priceUpdate);
          updates.push(priceUpdate);
        } else {
          console.log(`Symbol ${data.symbol} not found in update list, skipping...`);
        }
      }

      if (updates.length === 0) {
        console.log('No matching symbols found for market data');
        return 0;
      }

      // Upsert price data
      const { error: upsertError } = await supabase
        .from('symbol_prices')
        .upsert(updates, { 
          onConflict: 'symbol_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting price data:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully synced ${updates.length} symbols from Finnhub`);
      
      toast({
        title: 'Success',
        description: `Synced ${updates.length} symbols from Finnhub`,
      });

      return updates.length;

    } catch (error) {
      console.error('Error syncing market data:', error);
      toast({
        title: 'Sync Error',
        description: error instanceof Error ? error.message : 'Failed to sync market data',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncMarketData,
    syncing
  };
};
