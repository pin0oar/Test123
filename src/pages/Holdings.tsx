
import { Header } from '@/components/layout/Header';
import { HoldingsTable } from '@/components/holdings/HoldingsTable';
import { HoldingsCharts } from '@/components/holdings/HoldingsCharts';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useLanguage } from '@/hooks/useLanguage';
import { Holding } from '@/types/portfolio';

const Holdings = () => {
  const { portfolios } = usePortfolios();
  const { t } = useLanguage();
  
  // Aggregate all holdings from all portfolios
  const allHoldings: Holding[] = portfolios.flatMap(portfolio => 
    portfolio.holdings.map(holding => ({
      ...holding,
      portfolioName: portfolio.name
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('holdings')}
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Holdings: {allHoldings.length}
          </div>
        </div>

        {/* Holdings Table */}
        <HoldingsTable holdings={allHoldings} />

        {/* Holdings Charts */}
        <HoldingsCharts holdings={allHoldings} />
      </main>
    </div>
  );
};

export default Holdings;
