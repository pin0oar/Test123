
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio } from '@/types/portfolio';
import { useToast } from '@/hooks/use-toast';

export const usePortfolioCrud = (refetchPortfolios: () => void) => {
  const { toast } = useToast();

  const addPortfolio = useCallback(async (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'lastUpdated' | 'holdings'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a portfolio',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('portfolios')
        .insert([{
          name: portfolio.name,
          description: portfolio.description,
          total_value: portfolio.totalValue,
          total_pnl: portfolio.totalPnL,
          total_pnl_percentage: portfolio.totalPnLPercentage,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio created successfully'
      });

      refetchPortfolios();
    } catch (error) {
      console.error('Error adding portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to create portfolio',
        variant: 'destructive'
      });
    }
  }, [refetchPortfolios, toast]);

  const updatePortfolio = useCallback(async (id: string, updates: Partial<Portfolio>) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          name: updates.name,
          description: updates.description,
          total_value: updates.totalValue,
          total_pnl: updates.totalPnL,
          total_pnl_percentage: updates.totalPnLPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio updated successfully'
      });

      refetchPortfolios();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to update portfolio',
        variant: 'destructive'
      });
    }
  }, [refetchPortfolios, toast]);

  const deletePortfolio = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio deleted successfully'
      });

      refetchPortfolios();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio',
        variant: 'destructive'
      });
    }
  }, [refetchPortfolios, toast]);

  return {
    addPortfolio,
    updatePortfolio,
    deletePortfolio
  };
};
