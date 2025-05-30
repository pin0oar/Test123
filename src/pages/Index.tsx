
import { useState, useEffect } from 'react';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { ModernSidebar } from '@/components/layout/ModernSidebar';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { PerformanceTimeline } from '@/components/dashboard/PerformanceTimeline';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolios } from '@/hooks/usePortfolios';

const Index = () => {
  const { language } = useLanguage();
  const { portfolios, totalValue, totalPnL, totalPnLPercentage, addPortfolio } = usePortfolios();

  const handleAddPortfolio = (portfolioData: { name: string; description?: string; tickers?: string }) => {
    addPortfolio({
      name: portfolioData.name,
      description: portfolioData.description,
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercentage: 0
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <ModernSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ModernHeader />
        
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Portfolio Overview Cards */}
          <PortfolioOverview 
            totalValue={totalValue}
            totalPnL={totalPnL}
            totalPnLPercentage={totalPnLPercentage}
            portfolioCount={portfolios.length}
          />

          {/* Performance Timeline */}
          <PerformanceTimeline totalValue={totalValue} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <PortfolioSummary portfolios={portfolios} onAddPortfolio={handleAddPortfolio} />
              <QuickActions onAddPortfolio={handleAddPortfolio} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <MarketOverview />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
