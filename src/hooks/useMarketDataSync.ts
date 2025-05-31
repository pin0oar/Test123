
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMarketDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncMarketData = async () => {
    try {
      setSyncing(true);
      console.log('Starting market data sync using MarketAux edge function...');

      const { data, error } = await supabase.functions.invoke('marketaux-sync', {
        body: null,
        method: 'POST'
      });

      if (error) {
        console.error('MarketAux sync error:', error);
        throw new Error(error.message || 'Failed to sync market data');
      }

      const result = data || { updated: 0 };
      console.log('Sync result:', result);

      if (result.updated > 0) {
        toast({
          title: 'Success',
          description: `Synced ${result.updated} symbols from MarketAux`,
        });
      } else {
        toast({
          title: 'Info',
          description: result.message || 'No symbols needed updates at this time',
        });
      }

      return result.updated;

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
    syncing
  };
};
