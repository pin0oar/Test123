
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, TrendingUp, Calculator, DollarSign } from 'lucide-react';

export const RecentActivity = () => {
  const { t } = useLanguage();

  // Mock activity data
  const activities = [
    {
      icon: Plus,
      title: t('addedHolding'),
      description: 'AAPL - Apple Inc.',
      time: '2 hours ago',
      color: 'text-blue-600'
    },
    {
      icon: Calculator,
      title: t('zakatCalculated'),
      description: t('portfolioZakat'),
      time: '1 day ago',
      color: 'text-green-600'
    },
    {
      icon: DollarSign,
      title: t('dividendReceived'),
      description: 'Microsoft Corp - $45.20',
      time: '3 days ago',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: t('portfolioUpdate'),
      description: t('gainToday'),
      time: '1 week ago',
      color: 'text-green-600'
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
