import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinnhub } from './useFinnhub';
import { useToast } from '@/hooks/use-toast';
import { detectSymbolInfo } from './useSmartSymbolDetection';

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { getMarketData } = useFinnhub();
  const { toast } = useToast();

  const autoAddSymbol = async (symbol: string, name: string, exchangeCode?: string, currency?: string) => {
    try {
      console.log(`Auto-adding symbol: ${symbol} to symbols table`);
      
      // Auto-detect if not provided, but use standard exchange codes
      let symbolInfo = exchangeCode && currency 
        ? { exchangeCode, currency }
        : detectSymbolInfo(symbol);
      
      // Map to standard exchange codes that exist in the database
      if (symbolInfo.exchangeCode === 'Saudi Stock Exchange') {
        symbolInfo.exchangeCode = 'TADAWUL';
      }
      
      // First check if symbol already exists
      const { data: existing, error: checkError } = await supabase
        .from('symbols')
        .select('id')
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (checkError && !checkError.message.includes('No rows found')) {
        console.error('Error checking existing symbol:', checkError);
        throw new Error(`Failed to check existing symbol: ${checkError.message}`);
      }

      if (existing) {
        console.log('Symbol already exists:', existing.id);
        return existing.id;
      }

      // Get exchange ID - with better error handling
      const { data: exchange, error: exchangeError } = await supabase
        .from('exchanges')
        .select('id')
        .eq('code', symbolInfo.exchangeCode)
        .maybeSingle();

      if (exchangeError && !exchangeError.message.includes('No rows found')) {
        console.error('Error checking exchange:', exchangeError);
        throw new Error(`Failed to check exchange: ${exchangeError.message}`);
      }

      if (!exchange) {
        // Try to create the exchange if it doesn't exist
        console.log(`Exchange ${symbolInfo.exchangeCode} not found, creating it...`);
        const { data: newExchange, error: createError } = await supabase
          .from('exchanges')
          .insert([{
            code: symbolInfo.exchangeCode,
            name: symbolInfo.exchangeCode,
            country: symbolInfo.exchangeCode === 'TADAWUL' ? 'SA' : 'US',
            currency: symbolInfo.currency,
            timezone: symbolInfo.exchangeCode === 'TADAWUL' ? 'Asia/Riyadh' : 'America/New_York'
          }])
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating exchange:', createError);
          throw new Error(`Failed to create exchange ${symbolInfo.exchangeCode}: ${createError.message}`);
        }

        // Add new symbol with the newly created exchange
        const { data, error } = await supabase
          .from('symbols')
          .insert([{
            symbol: symbol.toUpperCase(),
            name: name,
            exchange_id: newExchange.id,
            currency: symbolInfo.currency,
            is_in_portfolio: false,
            is_active: true
          }])
          .select('id')
          .single();

        if (error) {
          console.error('Error creating symbol with new exchange:', error);
          throw new Error(`Failed to create symbol: ${error.message}`);
        }

        console.log('Symbol added successfully with new exchange:', data.id);
        return data.id;
      }

      // Add new symbol with existing exchange
      const { data, error } = await supabase
        .from('symbols')
        .insert([{
          symbol: symbol.toUpperCase(),
          name: name,
          exchange_id: exchange.id,
          currency: symbolInfo.currency,
          is_in_portfolio: false,
          is_active: true
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating symbol with existing exchange:', error);
        throw new Error(`Failed to create symbol: ${error.message}`);
      }

      console.log('Symbol added successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to auto-add symbol:', error);
      
      // Improve error handling with specific error types
      if (error instanceof Error) {
        throw new Error(`Symbol creation failed for ${symbol}: ${error.message}`);
      } else {
        throw new Error(`Symbol creation failed for ${symbol}: Unknown error`);
      }
    }
  };

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

      // Get market data from Finnhub for these symbols
      const symbolList = symbolsToUpdate.map(s => s.symbol);
      const marketData = await getMarketData(symbolList);
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
    autoAddSymbol,
    syncing
  };
};
