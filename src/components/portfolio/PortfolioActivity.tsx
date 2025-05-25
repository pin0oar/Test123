
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Portfolio } from '@/types/portfolio';
import { Plus, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

interface PortfolioActivityProps {
  portfolio: Portfolio;
}

export const PortfolioActivity = ({ portfolio }: PortfolioActivityProps) => {
  const { t } = useLanguage();

  // Mock activity data based on portfolio holdings
  const activities = [
    {
      icon: Plus,
      title: 'Added Holding',
      description: `${portfolio.holdings[0]?.symbol || 'AAPL'} - ${portfolio.holdings[0]?.name || 'Apple Inc.'}`,
      time: '2 hours ago',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Price Update',
      description: `${portfolio.holdings[0]?.symbol || 'AAPL'} +2.5%`,
      time: '4 hours ago',
      color: 'text-green-600'
    },
    {
      icon: DollarSign,
      title: 'Dividend Received',
      description: `${portfolio.holdings[0]?.symbol || 'AAPL'} - $12.50`,
      time: '1 day ago',
      color: 'text-purple-600'
    },
    {
      icon: AlertCircle,
      title: 'Price Alert',
      description: `${portfolio.holdings[0]?.symbol || 'AAPL'} reached target price`,
      time: '2 days ago',
      color: 'text-orange-600'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('recentActivity')}
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
