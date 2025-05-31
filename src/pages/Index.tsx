
import { ModernSidebar } from '@/components/layout/ModernSidebar';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { SaudiExchangeScraper } from '@/components/dashboard/SaudiExchangeScraper';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

const Index = () => {
  return (
    // Main application container with flex layout for sidebar and content
    <div className="flex min-h-screen bg-background">
      {/* Left sidebar for navigation - fixed width */}
      <ModernSidebar />
      
      {/* Main content area - flexible width */}
      <div className="flex-1 flex flex-col">
        {/* Top header bar */}
        <ModernHeader />
        
        {/* Main dashboard content with padding and scrollable area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard grid layout - responsive columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Portfolio summary card - spans full width on large screens */}
            <div className="lg:col-span-2 xl:col-span-3">
              <PortfolioSummary />
            </div>
            
            {/* Market overview - shows stock prices and market data */}
            <div className="lg:col-span-1">
              <MarketOverview />
            </div>

            {/* Saudi Exchange Scraper - new component for Saudi market data */}
            <div className="lg:col-span-1">
              <SaudiExchangeScraper />
            </div>
            
            {/* Quick actions panel - shortcuts for common tasks */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
            
            {/* Recent activity feed - spans remaining width */}
            <div className="lg:col-span-2 xl:col-span-3">
              <RecentActivity />
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
