
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectSymbolInfo } from './useSmartSymbolDetection';

export const useAutoAddSymbol = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const autoAddSymbol = async (
    symbol: string, 
    name: string, 
    exchangeCode?: string, 
    currency?: string
  ) => {
    try {
      setLoading(true);
      console.log(`Auto-adding symbol: ${symbol} to symbols table`);
      
      // Auto-detect symbol info if not provided
      const symbolInfo = exchangeCode && currency 
        ? { exchangeCode, currency }
        : detectSymbolInfo(symbol);
      
      // First check if symbol already exists
      const { data: existing, error: checkError } = await supabase
        .from('symbols')
        .select('id')
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (checkError && !checkError.message.includes('No rows found')) {
        throw checkError;
      }

      if (existing) {
        console.log('Symbol already exists:', existing.id);
        return existing.id;
      }

      // Get exchange ID
      const { data: exchange, error: exchangeError } = await supabase
        .from('exchanges')
        .select('id')
        .eq('code', symbolInfo.exchangeCode)
        .maybeSingle();

      if (exchangeError && !exchangeError.message.includes('No rows found')) {
        throw exchangeError;
      }

      if (!exchange) {
        throw new Error(`Exchange ${symbolInfo.exchangeCode} not found. Please ensure the exchange exists.`);
      }

      // Add new symbol
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

      if (error) throw error;

      console.log('Symbol added successfully:', data.id);
      
      toast({
        title: 'Symbol Added',
        description: `${symbol} has been added to tracked symbols`,
      });
      
      return data.id;
    } catch (error) {
      console.error('Error adding symbol:', error);
      toast({
        title: 'Error',
        description: `Failed to add symbol ${symbol}: ${error.message}`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    autoAddSymbol,
    loading
  };
};
