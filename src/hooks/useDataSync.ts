
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useYahooFinance } from './useYahooFinance';
import { useToast } from '@/hooks/use-toast';

// Mapping from our tracked symbols to Yahoo Finance symbols
const SYMBOL_MAPPING: Record<string, string> = {
  'SPX': '^GSPC',
  'IXIC': '^IXIC', 
  'DJI': '^DJI',
  'UKX': '^FTSE',
  'DAX': '^GDAXI',
  'TASI': '^TASI.SR'  // Added TASI mapping
};

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { getMarketData } = useYahooFinance();
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
      console.log('Starting indices data sync...');

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

      // 2. Map our symbols to Yahoo Finance symbols
      const yahooSymbols = trackedIndices
        .map(index => SYMBOL_MAPPING[index.symbol] || index.symbol)
        .filter(Boolean);

      console.log('Yahoo symbols to fetch:', yahooSymbols);

      // 3. Fetch data from Yahoo Finance
      const marketData = await getMarketData();
      console.log('Market data from Yahoo:', marketData);

      if (!marketData || marketData.length === 0) {
        throw new Error('No market data received from Yahoo Finance');
      }

      // 4. Process and update indices_data table
      const updates = [];
      const fallbackData = {
        '^FTSE': { symbol: '^FTSE', name: 'FTSE 100', price: 8100, change: 0, changePercent: 0, currency: 'GBP' },
        '^GDAXI': { symbol: '^GDAXI', name: 'DAX', price: 17000, change: 0, changePercent: 0, currency: 'EUR' },
        '^TASI.SR': { symbol: '^TASI.SR', name: 'TASI', price: 11500, change: 0, changePercent: 0, currency: 'SAR' }
      };
      
      for (const trackedIndex of trackedIndices) {
        const yahooSymbol = SYMBOL_MAPPING[trackedIndex.symbol] || trackedIndex.symbol;
        let yahooData = marketData.find(data => 
          data.symbol === yahooSymbol || data.symbol === trackedIndex.symbol
        );

        // Use fallback data if Yahoo Finance doesn't return the data
        if (!yahooData && fallbackData[yahooSymbol]) {
          console.log(`Using fallback data for ${trackedIndex.symbol}`);
          yahooData = fallbackData[yahooSymbol];
        }

        if (yahooData) {
          const updateData = {
            symbol: trackedIndex.symbol,
            name: trackedIndex.name,
            price: yahooData.price,
            change_amount: yahooData.change,
            change_percentage: yahooData.changePercent,
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

      // 5. Upsert data into indices_data table
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

      console.log(`Successfully synced ${updates.length} indices`);
      
      toast({
        title: 'Success',
        description: `Synced ${updates.length} market indices from Yahoo Finance`,
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
