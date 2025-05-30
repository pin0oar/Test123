
// Import React hooks and components
import { useState, useEffect } from 'react';

// Import layout components
import { ModernHeader } from '@/components/layout/ModernHeader';
import { ModernSidebar } from '@/components/layout/ModernSidebar';

// Import dashboard-specific components
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { PerformanceTimeline } from '@/components/dashboard/PerformanceTimeline';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

// Import custom hooks
import { useLanguage } from '@/hooks/useLanguage';
import { usePortfolios } from '@/hooks/usePortfolios';

// Main dashboard page component
const Index = () => {
  // Get current language setting (for potential future use)
  const { language } = useLanguage();
  
  // Get portfolio data and functions from custom hook
  const { 
    portfolios,           // Array of user's portfolios
    totalValue,          // Sum of all portfolio values
    totalPnL,            // Total profit/loss across all portfolios
    totalPnLPercentage,  // Total P&L as a percentage
    addPortfolio         // Function to create new portfolios
  } = usePortfolios();

  // Handler function for adding new portfolios
  const handleAddPortfolio = (portfolioData: { name: string; description?: string; tickers?: string }) => {
    // Call the addPortfolio function with portfolio data structure
    addPortfolio({
      name: portfolioData.name,
      description: portfolioData.description,
      totalValue: 0,        // New portfolios start with 0 value
      totalPnL: 0,          // No profit/loss initially
      totalPnLPercentage: 0 // 0% change initially
    });
  };

  return (
    // Main container with light background and flex layout
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Left sidebar for navigation */}
      <ModernSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top header bar */}
        <ModernHeader />
        
        {/* Main dashboard content with padding and spacing */}
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          
          {/* Top section: Portfolio overview cards showing key metrics */}
          <PortfolioOverview 
            totalValue={totalValue}
            totalPnL={totalPnL}
            totalPnLPercentage={totalPnLPercentage}
            portfolioCount={portfolios.length}
          />

          {/* Performance chart section */}
          <PerformanceTimeline totalValue={totalValue} />

          {/* Grid layout for main content and sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Main dashboard content (takes 2/3 of space on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio summary table */}
              <PortfolioSummary 
                portfolios={portfolios} 
                onAddPortfolio={handleAddPortfolio} 
              />
              
              {/* Quick action buttons for common tasks */}
              <QuickActions onAddPortfolio={handleAddPortfolio} />
            </div>

            {/* Right side: Secondary content (takes 1/3 of space on large screens) */}
            <div className="space-y-6">
              {/* Market overview widget */}
              <MarketOverview />
              
              {/* Recent activity feed */}
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Export the component as default
export default Index;
