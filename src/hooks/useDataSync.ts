
import { useSymbolCreation } from './useSymbolCreation';
import { useMarketDataSync } from './useMarketDataSync';

export const useDataSync = () => {
  const { autoAddSymbol } = useSymbolCreation();
  const { syncMarketData, syncing } = useMarketDataSync();

  return {
    syncMarketData,
    autoAddSymbol,
    syncing
  };
};
