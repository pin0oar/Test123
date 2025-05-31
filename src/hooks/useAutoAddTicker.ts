
import { useState } from 'react';
import { useSymbolCreation } from './useSymbolCreation';
import { useToast } from '@/hooks/use-toast';
import { detectSymbolInfo } from './useSmartSymbolDetection';

export const useAutoAddTicker = () => {
  const [loading, setLoading] = useState(false);
  const { autoAddSymbol } = useSymbolCreation();
  const { toast } = useToast();

  const addTickerIfNotExists = async (symbol: string, name: string, exchangeCode?: string, currency?: string) => {
    try {
      setLoading(true);
      console.log(`Checking and adding ticker: ${symbol}`);
      
      // Auto-detect symbol info if not provided
      const symbolInfo = exchangeCode && currency 
        ? { exchangeCode, currency }
        : detectSymbolInfo(symbol);
      
      console.log(`Detected symbol info for ${symbol}:`, symbolInfo);
      
      const symbolId = await autoAddSymbol(symbol, name, symbolInfo.exchangeCode, symbolInfo.currency);
      
      toast({
        title: 'Symbol Added',
        description: `${symbol} has been added to tracked symbols`,
      });
      
      return symbolId;
    } catch (error) {
      console.error('Error adding ticker:', error);
      
      // More specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('not found')) {
        toast({
          title: 'Exchange Not Found',
          description: `The exchange for ${symbol} is not supported yet. Please contact support.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to add symbol ${symbol}: ${errorMessage}`,
          variant: 'destructive'
        });
      }
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
