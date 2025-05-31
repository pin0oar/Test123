
import { supabase } from '@/integrations/supabase/client';
import { detectSymbolInfo } from './useSmartSymbolDetection';

export const useSymbolCreation = () => {
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

  return {
    autoAddSymbol
  };
};
