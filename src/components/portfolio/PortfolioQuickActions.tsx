
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Calculator, TrendingUp, FileText } from 'lucide-react';
import { AddHoldingModal } from './AddHoldingModal';
import { Portfolio } from '@/types/portfolio';

interface PortfolioQuickActionsProps {
  portfolio: Portfolio;
  onHoldingAdded: () => void;
}

export const PortfolioQuickActions = ({ portfolio, onHoldingAdded }: PortfolioQuickActionsProps) => {
  const { t } = useLanguage();
  const [isAddHoldingModalOpen, setIsAddHoldingModalOpen] = useState(false);

  const actions = [
    {
      icon: Plus,
      label: t('addHolding'),
      description: 'Add a new stock position',
      color: 'bg-blue-500',
      action: () => setIsAddHoldingModalOpen(true)
    },
    {
      icon: Calculator,
      label: t('calculateZakat'),
      description: t('calculateZakatDesc'),
      color: 'bg-green-500',
      action: () => console.log('Calculate zakat')
    },
    {
      icon: TrendingUp,
      label: t('trackDividends'),
      description: t('trackDividendsDesc'),
      color: 'bg-purple-500',
      action: () => console.log('Track dividends')
    },
    {
      icon: FileText,
      label: 'Export Data',
      description: 'Export portfolio data',
      color: 'bg-orange-500',
      action: () => console.log('Export data')
    }
  ];

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start text-left"
              onClick={action.action}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {action.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      <AddHoldingModal
        isOpen={isAddHoldingModalOpen}
        onClose={() => setIsAddHoldingModalOpen(false)}
        portfolio={portfolio}
        onHoldingAdded={onHoldingAdded}
      />
    </>
  );
};
