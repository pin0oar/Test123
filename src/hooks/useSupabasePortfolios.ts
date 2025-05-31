
import { useEffect } from 'react';
import { usePortfolioData } from './usePortfolioData';
import { usePortfolioCrud } from './usePortfolioCrud';
import { calculateTotalPortfolioMetrics } from '@/utils/portfolioCalculations';

export const useSupabasePortfolios = () => {
  const { portfolios, loading, fetchPortfolios } = usePortfolioData();
  const { addPortfolio, updatePortfolio, deletePortfolio } = usePortfolioCrud(fetchPortfolios);

  // Calculate totals from individual portfolios
  const { totalValue, totalPnL, totalPnLPercentage } = calculateTotalPortfolioMetrics(portfolios);

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
