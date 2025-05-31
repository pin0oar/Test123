
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinnhub } from './useFinnhub';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { getMarketData } = useFinnhub();
  const { toast } = useToast();

  const autoAddSymbol = async (symbol: string, name: string, exchangeCode: string = 'NYSE', currency: string = 'USD') => {
    try {
      console.log(`Auto-adding symbol: ${symbol} to symbols table`);
      
      // First check if symbol already exists
      const { data: existing, error: checkError } = await supabase
        .from('symbols')
        .select('id')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (existing) {
        console.log('Symbol already exists:', existing.id);
        return existing.id;
      }

      // Get exchange ID
      const { data: exchange, error: exchangeError } = await supabase
        .from('exchanges')
        .select('id')
        .eq('code', exchangeCode)
        .single();

      if (exchangeError) {
        throw new Error(`Exchange ${exchangeCode} not found`);
      }

      // Add new symbol
      const { data, error } = await supabase
        .from('symbols')
        .insert([{
          symbol: symbol.toUpperCase(),
          name: name,
          exchange_id: exchange.id,
          currency: currency,
          is_in_portfolio: false,
          is_active: true
        }])
        .select('id')
        .single();

      if (error) throw error;

      console.log('Symbol added successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to auto-add symbol:', error);
      throw error;
    }
  };

  const syncMarketData = async () => {
    try {
      setSyncing(true);
      console.log('Starting market data sync using Finnhub...');

      // Get market data from Finnhub
      const marketData = await getMarketData();
      console.log('Market data from Finnhub:', marketData);

      if (!marketData || marketData.length === 0) {
        throw new Error('No market data received from Finnhub');
      }

      // Update symbols that have corresponding data
      const updates = [];
      
      for (const data of marketData) {
        // Find the symbol in our database
        const { data: symbolData, error: symbolError } = await supabase
          .from('symbols')
          .select('id, symbol')
          .eq('symbol', data.symbol.toUpperCase())
          .eq('is_active', true)
          .single();

        if (symbolData && !symbolError) {
          // Update or insert price data
          const priceUpdate = {
            symbol_id: symbolData.id,
            price: data.price,
            change_amount: data.change,
            change_percentage: data.changePercent,
            data_source: 'finnhub',
            market_session: 'regular',
            fetched_at: new Date().toISOString()
          };

          console.log('Updating price for:', symbolData.symbol, priceUpdate);
          updates.push(priceUpdate);
        }
      }

      if (updates.length === 0) {
        throw new Error('No matching symbols found for market data');
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
        description: error.message || 'Failed to sync market data',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncMarketData,
    autoAddSymbol,
    syncing
  };
};
