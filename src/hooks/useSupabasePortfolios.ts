
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio, Holding } from '@/types/portfolio';
import { useToast } from '@/hooks/use-toast';

export const useSupabasePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch portfolios with their holdings
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select(`
          id,
          name,
          description,
          total_value,
          total_pnl,
          total_pnl_percentage,
          created_at,
          updated_at,
          holdings (
            id,
            symbol,
            name,
            market,
            lot_id,
            quantity,
            avg_price,
            current_price,
            total_value,
            pnl,
            pnl_percentage,
            currency,
            is_halal,
            dividend_yield,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (portfoliosError) throw portfoliosError;

      const transformedPortfolios: Portfolio[] = (portfoliosData || []).map(portfolio => ({
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: Number(portfolio.total_value),
        totalPnL: Number(portfolio.total_pnl),
        totalPnLPercentage: Number(portfolio.total_pnl_percentage),
        createdAt: new Date(portfolio.created_at),
        lastUpdated: new Date(portfolio.updated_at),
        holdings: (portfolio.holdings || []).map((holding: any): Holding => ({
          id: holding.id,
          symbol: holding.symbol,
          name: holding.name,
          market: holding.market,
          lotId: holding.lot_id,
          quantity: holding.quantity,
          avgPrice: Number(holding.avg_price),
          currentPrice: Number(holding.current_price),
          totalValue: Number(holding.total_value),
          pnl: Number(holding.pnl),
          pnlPercentage: Number(holding.pnl_percentage),
          currency: holding.currency,
          isHalal: holding.is_halal,
          dividendYield: Number(holding.dividend_yield),
          createdAt: new Date(holding.created_at),
          lastUpdated: new Date(holding.updated_at)
        }))
      }));

      setPortfolios(transformedPortfolios);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolios',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

      fetchPortfolios();
    } catch (error) {
      console.error('Error adding portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to create portfolio',
        variant: 'destructive'
      });
    }
  }, [fetchPortfolios, toast]);

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

      fetchPortfolios();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to update portfolio',
        variant: 'destructive'
      });
    }
  }, [fetchPortfolios, toast]);

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

      fetchPortfolios();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio',
        variant: 'destructive'
      });
    }
  }, [fetchPortfolios, toast]);

  // Calculate totals from individual portfolios
  const totalValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  const totalPnL = portfolios.reduce((sum, portfolio) => sum + portfolio.totalPnL, 0);
  const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return {
    portfolios,
    loading,
    totalValue,
    totalPnL,
    totalPnLPercentage,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    refetch: fetchPortfolios
  };
};
