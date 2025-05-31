
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TickerSearch } from '@/components/ui/ticker-search';
import { useAutoAddTicker } from '@/hooks/useAutoAddTicker';
import { useToast } from '@/hooks/use-toast';
import { Portfolio } from '@/types/portfolio';
import { supabase } from '@/integrations/supabase/client';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  onHoldingAdded: () => void;
}

export const AddHoldingModal = ({ isOpen, onClose, portfolio, onHoldingAdded }: AddHoldingModalProps) => {
  const [selectedTicker, setSelectedTicker] = useState<{symbol: string; name: string; exchange: string} | null>(null);
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [lotId, setLotId] = useState('LOT-001');
  const [loading, setLoading] = useState(false);
  const { addTickerIfNotExists } = useAutoAddTicker();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicker || !quantity || !avgPrice) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // Auto-add ticker to symbols table and get the symbol_id
      const symbolId = await addTickerIfNotExists(
        selectedTicker.symbol,
        selectedTicker.name,
        selectedTicker.exchange,
        'USD'
      );

      // Calculate total value and basic PnL (using avg price as current price for now)
      const qty = parseInt(quantity);
      const price = parseFloat(avgPrice);
      const totalValue = qty * price;

      // Add holding to portfolio with symbol_id
      const { error } = await supabase
        .from('holdings')
        .insert({
          portfolio_id: portfolio.id,
          symbol: selectedTicker.symbol,
          name: selectedTicker.name,
          market: selectedTicker.exchange,
          lot_id: lotId,
          quantity: qty,
          avg_price: price,
          current_price: price, // Use avg price as current price initially
          total_value: totalValue,
          pnl: 0, // No P&L initially
          pnl_percentage: 0,
          currency: 'USD',
          symbol_id: symbolId // Ensure symbol_id is set
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Added ${selectedTicker.symbol} to ${portfolio.name}`,
      });

      // Reset form
      setSelectedTicker(null);
      setQuantity('');
      setAvgPrice('');
      setLotId('LOT-001');
      
      onHoldingAdded();
      onClose();

    } catch (error) {
      console.error('Error adding holding:', error);
      toast({
        title: 'Error',
        description: 'Failed to add holding to portfolio',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Holding to {portfolio.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ticker">Stock/Ticker *</Label>
            <TickerSearch
              value={selectedTicker?.symbol || ''}
              onSelect={setSelectedTicker}
              placeholder="Search for stocks..."
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Number of shares"
              required
            />
          </div>

          <div>
            <Label htmlFor="avgPrice">Average Price *</Label>
            <Input
              id="avgPrice"
              type="number"
              step="0.01"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="Purchase price per share"
              required
            />
          </div>

          <div>
            <Label htmlFor="lotId">Lot ID</Label>
            <Input
              id="lotId"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              placeholder="LOT-001"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Holding'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
