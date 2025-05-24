
import { useState, useCallback, useMemo } from 'react';
import { Portfolio, Holding } from '@/types/portfolio';

// Mock data for demonstration
const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: 'Growth Portfolio',
    description: 'Long-term growth investments',
    totalValue: 125000,
    totalPnL: 15000,
    totalPnLPercentage: 13.64,
    holdings: [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        market: 'NASDAQ',
        quantity: 100,
        avgPrice: 150,
        currentPrice: 175,
        totalValue: 17500,
        pnl: 2500,
        pnlPercentage: 16.67,
        currency: 'USD',
        isHalal: true,
        dividendYield: 0.5,
        lastUpdated: new Date()
      }
    ],
    createdAt: new Date(),
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'Dividend Portfolio',
    description: 'Income-focused investments',
    totalValue: 85000,
    totalPnL: 5000,
    totalPnLPercentage: 6.25,
    holdings: [],
    createdAt: new Date(),
    lastUpdated: new Date()
  }
];

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);

  const totalValue = useMemo(() => {
    return portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  }, [portfolios]);

  const totalPnL = useMemo(() => {
    return portfolios.reduce((sum, portfolio) => sum + portfolio.totalPnL, 0);
  }, [portfolios]);

  const totalPnLPercentage = useMemo(() => {
    if (totalValue === 0) return 0;
    const totalCost = totalValue - totalPnL;
    return (totalPnL / totalCost) * 100;
  }, [totalValue, totalPnL]);

  const addPortfolio = useCallback((portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const newPortfolio: Portfolio = {
      ...portfolio,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    setPortfolios(prev => [...prev, newPortfolio]);
  }, []);

  const updatePortfolio = useCallback((id: string, updates: Partial<Portfolio>) => {
    setPortfolios(prev => prev.map(portfolio => 
      portfolio.id === id 
        ? { ...portfolio, ...updates, lastUpdated: new Date() }
        : portfolio
    ));
  }, []);

  const deletePortfolio = useCallback((id: string) => {
    setPortfolios(prev => prev.filter(portfolio => portfolio.id !== id));
  }, []);

  return {
    portfolios,
    totalValue,
    totalPnL,
    totalPnLPercentage,
    addPortfolio,
    updatePortfolio,
    deletePortfolio
  };
};
