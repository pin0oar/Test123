
import { Holding } from '@/types/portfolio';

export const calculatePortfolioTotals = (holdings: Holding[]) => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const totalPnL = holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  const totalCost = totalValue - totalPnL;
  const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  
  return { totalValue, totalPnL, totalPnLPercentage };
};

export const calculateTotalPortfolioMetrics = (portfolios: any[]) => {
  const totalValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  const totalPnL = portfolios.reduce((sum, portfolio) => sum + portfolio.totalPnL, 0);
  const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
  
  return { totalValue, totalPnL, totalPnLPercentage };
};
