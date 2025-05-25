
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { PortfolioDetailOverview } from '@/components/portfolio/PortfolioDetailOverview';
import { PortfolioPerformanceChart } from '@/components/portfolio/PortfolioPerformanceChart';
import { PortfolioHoldings } from '@/components/portfolio/PortfolioHoldings';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { PortfolioActivity } from '@/components/portfolio/PortfolioActivity';
import { PortfolioNews } from '@/components/portfolio/PortfolioNews';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useLanguage } from '@/hooks/useLanguage';

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolios } = usePortfolios();
  const { t } = useLanguage();
  
  const portfolio = portfolios.find(p => p.id === id);

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('portfolioNotFound')}
            </h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Overview */}
        <PortfolioDetailOverview portfolio={portfolio} />

        {/* Performance Chart */}
        <PortfolioPerformanceChart portfolio={portfolio} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioHoldings portfolio={portfolio} />
            <PortfolioNews portfolio={portfolio} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MarketOverview />
            <PortfolioActivity portfolio={portfolio} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortfolioDetail;
