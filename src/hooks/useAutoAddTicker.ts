
import { useState } from 'react';
import { useDataSync } from './useDataSync';
import { useToast } from '@/hooks/use-toast';

export const useAutoAddTicker = () => {
  const [loading, setLoading] = useState(false);
  const { autoAddTicker } = useDataSync();
  const { toast } = useToast();

  const addTickerIfNotExists = async (symbol: string, name: string, market?: string, currency: string = 'USD') => {
    try {
      setLoading(true);
      console.log(`Checking and adding ticker: ${symbol}`);
      
      const tickerId = await autoAddTicker(symbol, name, market, currency);
      
      toast({
        title: 'Ticker Added',
        description: `${symbol} has been added to tracked tickers`,
      });
      
      return tickerId;
    } catch (error) {
      console.error('Error adding ticker:', error);
      toast({
        title: 'Error',
        description: `Failed to add ticker ${symbol}`,
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
