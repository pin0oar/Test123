
import { supabase } from '@/integrations/supabase/client';

export const useHoldingSymbolMapping = () => {
  const findMissingSymbolHoldings = async () => {
    console.log('Checking for holdings with missing symbols...');

    // Find holdings that have no symbol_id reference
    const { data: holdingsWithMissingSymbols, error: holdingsError } = await supabase
      .from('holdings')
      .select(`
        id,
        symbol,
        name,
        market,
        currency,
        symbol_id
      `)
      .is('symbol_id', null);

    if (holdingsError) throw holdingsError;

    return holdingsWithMissingSymbols || [];
  };

  const linkExistingSymbol = async (holdingId: string, symbol: string) => {
    // Check if symbol exists in symbols table
    const { data: existingSymbol, error: symbolError } = await supabase
      .from('symbols')
      .select('id')
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    if (symbolError && !symbolError.message.includes('No rows found')) {
      throw symbolError;
    }

    if (existingSymbol) {
      // Update the holding with the existing symbol_id
      const { error: updateError } = await supabase
        .from('holdings')
        .update({ symbol_id: existingSymbol.id })
        .eq('id', holdingId);
        
      if (updateError) throw updateError;
      
      console.log(`Updated holding ${holdingId} with symbol_id ${existingSymbol.id}`);
      return true;
    }

    return false;
  };

  return {
    findMissingSymbolHoldings,
    linkExistingSymbol
  };
};
