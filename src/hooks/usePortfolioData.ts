
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio, Holding } from '@/types/portfolio';
import { useToast } from '@/hooks/use-toast';
import { calculatePortfolioTotals } from '@/utils/portfolioCalculations';

export const usePortfolioData = () => {
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

      const transformedPortfolios: Portfolio[] = (portfoliosData || []).map(portfolio => {
        const holdings: Holding[] = (portfolio.holdings || []).map((holding: any): Holding => ({
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
        }));

        // Calculate actual totals from holdings
        const calculatedTotals = calculatePortfolioTotals(holdings);

        return {
          id: portfolio.id,
          name: portfolio.name,
          description: portfolio.description,
          totalValue: calculatedTotals.totalValue,
          totalPnL: calculatedTotals.totalPnL,
          totalPnLPercentage: calculatedTotals.totalPnLPercentage,
          createdAt: new Date(portfolio.created_at),
          lastUpdated: new Date(portfolio.updated_at),
          holdings
        };
      });

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

  return {
    portfolios,
    loading,
    fetchPortfolios,
    setPortfolios
  };
};
