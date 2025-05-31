
import { supabase } from '@/integrations/supabase/client';
import { useExchangeManagement } from './useExchangeManagement';

export const useHoldingSymbolCreation = () => {
  const { getOrCreateExchange } = useExchangeManagement();

  const createSymbolForHolding = async (holding: {
    id: string;
    symbol: string;
    name: string;
    market: string;
    currency: string;
  }) => {
    console.log(`Creating missing symbol: ${holding.symbol}`);
    
    // Determine exchange based on market or currency
    let exchangeCode = 'NYSE'; // default
    if (holding.market === 'TADAWUL' || holding.currency === 'SAR') {
      exchangeCode = 'TADAWUL';
    } else if (holding.market === 'LSE' || holding.currency === 'GBP') {
      exchangeCode = 'LSE';
    }

    const exchangeId = await getOrCreateExchange(exchangeCode, holding.currency);

    // Add the symbol
    const { data: newSymbol, error: insertError } = await supabase
      .from('symbols')
      .insert([{
        symbol: holding.symbol.toUpperCase(),
        name: holding.name,
        exchange_id: exchangeId,
        currency: holding.currency || 'USD',
        is_in_portfolio: true,
        is_active: true
      }])
      .select('id')
      .single();

    if (insertError) throw insertError;

    // Update the holding with the new symbol_id
    const { error: updateError } = await supabase
      .from('holdings')
      .update({ symbol_id: newSymbol.id })
      .eq('id', holding.id);
      
    if (updateError) throw updateError;

    console.log(`Successfully created symbol and updated holding: ${holding.symbol}`);
    return newSymbol.id;
  };

  return {
    createSymbolForHolding
  };
};
