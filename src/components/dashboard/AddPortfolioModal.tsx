
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TickerSearch } from '@/components/ui/ticker-search';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPortfolio: (portfolio: { name: string; description?: string; tickers?: string }) => void;
}

interface SelectedTicker {
  symbol: string;
  name: string;
  exchange: string;
}

export const AddPortfolioModal = ({ isOpen, onClose, onAddPortfolio }: AddPortfolioModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedTickers, setSelectedTickers] = useState<SelectedTicker[]>([]);

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

    const tickersString = selectedTickers.map(t => t.symbol).join(', ');

    onAddPortfolio({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      tickers: tickersString || undefined
    });

    // Reset form
    setFormData({ name: '', description: '' });
    setSelectedTickers([]);
    onClose();

    toast({
      title: t('success'),
      description: t('portfolioCreated'),
    });
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setSelectedTickers([]);
    onClose();
  };

  const handleTickerSelect = (ticker: SelectedTicker) => {
    if (!selectedTickers.find(t => t.symbol === ticker.symbol)) {
      setSelectedTickers(prev => [...prev, ticker]);
    }
  };

  const removeTicker = (symbol: string) => {
    setSelectedTickers(prev => prev.filter(t => t.symbol !== symbol));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
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
            <Label className="text-sm font-medium">
              Initial Tickers ({t('optional')})
            </Label>
            <TickerSearch
              onSelect={handleTickerSelect}
              placeholder="Search and add tickers..."
            />
            
            {selectedTickers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTickers.map((ticker) => (
                  <div
                    key={ticker.symbol}
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm"
                  >
                    <span className="font-medium">{ticker.symbol}</span>
                    <span className="text-xs opacity-75">• {ticker.exchange}</span>
                    <button
                      type="button"
                      onClick={() => removeTicker(ticker.symbol)}
                      className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Search for stocks, ETFs, and other securities to add to your portfolio
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
