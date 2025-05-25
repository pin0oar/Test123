
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinnhub } from './useFinnhub';
import { useToast } from '@/hooks/use-toast';

// Mapping from our tracked symbols to Finnhub symbols
const SYMBOL_MAPPING: Record<string, string> = {
  'SPX': '^GSPC',
  'IXIC': '^IXIC', 
  'DJI': '^DJI',
  'UKX': '^FTSE',
  'DAX': '^GDAXI',
  'TASI': 'TASI.SR'
};

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { getMarketData } = useFinnhub();
  const { toast } = useToast();

  const autoAddTicker = async (symbol: string, name: string, market?: string, currency: string = 'USD') => {
    try {
      console.log(`Auto-adding ticker: ${symbol}`);
      
      const { data, error } = await supabase.rpc('auto_add_ticker', {
        p_symbol: symbol,
        p_name: name,
        p_market: market,
        p_currency: currency
      });

      if (error) {
        console.error('Error auto-adding ticker:', error);
        throw error;
      }

      console.log(`Ticker ${symbol} auto-added with ID:`, data);
      return data;
    } catch (error) {
      console.error('Failed to auto-add ticker:', error);
      throw error;
    }
  };

  const syncIndicesData = async () => {
    try {
      setSyncing(true);
      console.log('Starting indices data sync using Finnhub...');

      // 1. Get all active tracked indices
      const { data: trackedIndices, error: fetchError } = await supabase
        .from('tracked_indices')
        .select('*')
        .eq('is_active', true);

      if (fetchError) {
        console.error('Error fetching tracked indices:', fetchError);
        throw fetchError;
      }

      if (!trackedIndices || trackedIndices.length === 0) {
        console.log('No tracked indices found');
        return;
      }

      console.log('Found tracked indices:', trackedIndices);

      // 2. Fetch data from Finnhub
      const marketData = await getMarketData();
      console.log('Market data from Finnhub:', marketData);

      if (!marketData || marketData.length === 0) {
        throw new Error('No market data received from Finnhub');
      }

      // 3. Process and update indices_data table
      const updates = [];
      
      for (const trackedIndex of trackedIndices) {
        const finnhubSymbol = SYMBOL_MAPPING[trackedIndex.symbol] || trackedIndex.symbol;
        let finnhubData = marketData.find(data => 
          data.symbol === trackedIndex.symbol || data.symbol === finnhubSymbol.replace('^', '')
        );

        if (finnhubData) {
          const updateData = {
            symbol: trackedIndex.symbol,
            name: trackedIndex.name,
            price: finnhubData.price,
            change_amount: finnhubData.change,
            change_percentage: finnhubData.changePercent,
            currency: trackedIndex.currency,
            last_updated: new Date().toISOString(),
            is_active: true,
            tracked_index_id: trackedIndex.id
          };

          console.log('Preparing update for:', trackedIndex.symbol, updateData);
          updates.push(updateData);
        }
      }

      if (updates.length === 0) {
        throw new Error('No matching data found for tracked indices');
      }

      // 4. Upsert data into indices_data table
      const { error: upsertError } = await supabase
        .from('indices_data')
        .upsert(updates, { 
          onConflict: 'symbol',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting indices data:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully synced ${updates.length} indices from Finnhub`);
      
      toast({
        title: 'Success',
        description: `Synced ${updates.length} market indices from Finnhub`,
      });

      return updates.length;

    } catch (error) {
      console.error('Error syncing indices data:', error);
      toast({
        title: 'Sync Error',
        description: error.message || 'Failed to sync market data',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncIndicesData,
    autoAddTicker,
    syncing
  };
};
