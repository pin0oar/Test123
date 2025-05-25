
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Portfolio } from '@/types/portfolio';
import { ExternalLink } from 'lucide-react';

interface PortfolioNewsProps {
  portfolio: Portfolio;
}

export const PortfolioNews = ({ portfolio }: PortfolioNewsProps) => {
  const { t } = useLanguage();

  // Mock news data based on portfolio holdings
  const news = [
    {
      title: `${portfolio.holdings[0]?.symbol || 'AAPL'} Reports Strong Q4 Earnings`,
      summary: 'Company beats analyst expectations with record revenue growth',
      source: 'Financial Times',
      time: '2 hours ago',
      url: '#'
    },
    {
      title: `Market Analysis: ${portfolio.holdings[0]?.symbol || 'AAPL'} Price Target Raised`,
      summary: 'Analysts increase price target following positive market sentiment',
      source: 'Reuters',
      time: '5 hours ago',
      url: '#'
    },
    {
      title: 'Tech Sector Shows Resilience Despite Market Volatility',
      summary: 'Technology stocks continue to outperform broader market indices',
      source: 'Bloomberg',
      time: '1 day ago',
      url: '#'
    },
    {
      title: `${portfolio.holdings[0]?.symbol || 'AAPL'} Announces New Product Launch`,
      summary: 'Company unveils innovative products expected to drive future growth',
      source: 'CNBC',
      time: '2 days ago',
      url: '#'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Related News
      </h3>
      
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {item.source} • {item.time}
                  </span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
