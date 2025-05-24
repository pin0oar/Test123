
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
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
  const { portfolios, totalValue, totalPnL, totalPnLPercentage } = usePortfolios();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
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
            <PortfolioSummary portfolios={portfolios} />
            <QuickActions />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MarketOverview />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
