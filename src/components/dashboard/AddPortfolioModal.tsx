
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPortfolio: (portfolio: { name: string; description?: string; tickers?: string }) => void;
}

export const AddPortfolioModal = ({ isOpen, onClose, onAddPortfolio }: AddPortfolioModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tickers: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: t('portfolioNameRequired'),
        variant: "destructive"
      });
      return;
    }

    onAddPortfolio({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      tickers: formData.tickers.trim() || undefined
    });

    // Reset form
    setFormData({ name: '', description: '', tickers: '' });
    onClose();

    toast({
      title: t('success'),
      description: t('portfolioCreated'),
    });
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', tickers: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('createPortfolio')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolioName" className="text-sm font-medium">
              {t('portfolioName')} *
            </Label>
            <Input
              id="portfolioName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('enterPortfolioName')}
              className="w-full"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioDescription" className="text-sm font-medium">
              {t('description')} ({t('optional')})
            </Label>
            <Textarea
              id="portfolioDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('enterPortfolioDescription')}
              className="w-full min-h-[80px]"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialTickers" className="text-sm font-medium">
              {t('initialTickers')} ({t('optional')})
            </Label>
            <Textarea
              id="initialTickers"
              value={formData.tickers}
              onChange={(e) => setFormData(prev => ({ ...prev, tickers: e.target.value }))}
              placeholder={t('enterTickersPlaceholder')}
              className="w-full min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('tickersHint')}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('createPortfolio')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
