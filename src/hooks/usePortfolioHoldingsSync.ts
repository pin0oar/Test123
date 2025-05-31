
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHoldingSymbolMapping } from './useHoldingSymbolMapping';
import { useHoldingSymbolCreation } from './useHoldingSymbolCreation';

export const usePortfolioHoldingsSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { findMissingSymbolHoldings, linkExistingSymbol } = useHoldingSymbolMapping();
  const { createSymbolForHolding } = useHoldingSymbolCreation();

  const syncMissingSymbols = async () => {
    try {
      setSyncing(true);
      
      const holdingsWithMissingSymbols = await findMissingSymbolHoldings();

      if (holdingsWithMissingSymbols.length === 0) {
        console.log('No holdings with missing symbols found');
        return 0;
      }

      let addedCount = 0;

      for (const holding of holdingsWithMissingSymbols) {
        console.log(`Processing holding with missing symbol_id: ${holding.symbol}`);
        
        try {
          // Try to link with existing symbol first
          const linked = await linkExistingSymbol(holding.id, holding.symbol);
          
          if (linked) {
            addedCount++;
          } else {
            // Create new symbol if none exists
            await createSymbolForHolding(holding);
            addedCount++;
          }
        } catch (error) {
          console.error(`Failed to process holding ${holding.symbol}:`, error);
        }
      }

      if (addedCount > 0) {
        toast({
          title: 'Symbols Synced',
          description: `Updated ${addedCount} holdings with proper symbol references`,
        });
      }

      console.log(`Sync complete. Updated ${addedCount} holdings.`);
      return addedCount;

    } catch (error) {
      console.error('Error syncing missing symbols:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync missing symbols',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncMissingSymbols,
    syncing
  };
};
