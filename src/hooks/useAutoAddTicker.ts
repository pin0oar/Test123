
import { useState } from 'react';
import { useDataSync } from './useDataSync';
import { useToast } from '@/hooks/use-toast';

export const useAutoAddTicker = () => {
  const [loading, setLoading] = useState(false);
  const { autoAddSymbol } = useDataSync();
  const { toast } = useToast();

  const addTickerIfNotExists = async (symbol: string, name: string, exchangeCode: string = 'NYSE', currency: string = 'USD') => {
    try {
      setLoading(true);
      console.log(`Checking and adding ticker: ${symbol}`);
      
      const symbolId = await autoAddSymbol(symbol, name, exchangeCode, currency);
      
      toast({
        title: 'Symbol Added',
        description: `${symbol} has been added to tracked symbols`,
      });
      
      return symbolId;
    } catch (error) {
      console.error('Error adding ticker:', error);
      toast({
        title: 'Error',
        description: `Failed to add symbol ${symbol}`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addTickerIfNotExists,
    loading
  };
};
