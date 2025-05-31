
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Symbol {
  id: string;
  symbol: string;
  name: string;
  exchange_id: string;
  exchange_code: string;
  exchange_name: string;
  currency: string;
  sector?: string;
  industry?: string;
  is_in_portfolio: boolean;
  is_active: boolean;
  is_halal?: boolean;
  alternative_name_1?: string;
  alternative_name_2?: string;
  alternative_name_3?: string;
  alternative_name_4?: string;
}

interface SymbolPrice {
  id: string;
  symbol_id: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  volume?: number;
  market_cap?: number;
  high_52_week?: number;
  low_52_week?: number;
  dividend_yield?: number;
  data_source: string;
  fetched_at: string;
  market_session: string;
}

export const useSymbols = () => {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSymbols = async (inPortfolioOnly = false) => {
    try {
      setLoading(true);
      console.log('Fetching symbols from new schema...');

      let query = supabase
        .from('symbols')
        .select(`
          id,
          symbol,
          name,
          exchange_id,
          currency,
          sector,
          industry,
          is_in_portfolio,
          is_active,
          is_halal,
          alternative_name_1,
          alternative_name_2,
          alternative_name_3,
          alternative_name_4,
          exchanges!inner (
            id,
            code,
            name
          )
        `)
        .eq('is_active', true);

      if (inPortfolioOnly) {
        query = query.eq('is_in_portfolio', true);
      }

      const { data, error } = await query.order('symbol');

      if (error) throw error;

      const transformedSymbols: Symbol[] = (data || []).map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        exchange_id: item.exchange_id,
        exchange_code: item.exchanges.code,
        exchange_name: item.exchanges.name,
        currency: item.currency,
        sector: item.sector,
        industry: item.industry,
        is_in_portfolio: item.is_in_portfolio,
        is_active: item.is_active,
        is_halal: item.is_halal,
        alternative_name_1: item.alternative_name_1,
        alternative_name_2: item.alternative_name_2,
        alternative_name_3: item.alternative_name_3,
        alternative_name_4: item.alternative_name_4,
      }));

      setSymbols(transformedSymbols);
      console.log('Fetched symbols:', transformedSymbols.length);
    } catch (error) {
      console.error('Error fetching symbols:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch symbols',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addSymbol = async (symbolData: {
    symbol: string;
    name: string;
    exchange_code: string;
    currency?: string;
    sector?: string;
    industry?: string;
    is_halal?: boolean;
  }) => {
    try {
      // First get the exchange ID
      const { data: exchange, error: exchangeError } = await supabase
        .from('exchanges')
        .select('id')
        .eq('code', symbolData.exchange_code)
        .single();

      if (exchangeError) throw exchangeError;

      const { data, error } = await supabase
        .from('symbols')
        .insert([{
          symbol: symbolData.symbol.toUpperCase(),
          name: symbolData.name,
          exchange_id: exchange.id,
          currency: symbolData.currency || 'USD',
          sector: symbolData.sector,
          industry: symbolData.industry,
          is_halal: symbolData.is_halal,
          is_in_portfolio: false
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Symbol ${symbolData.symbol} added successfully`
      });

      fetchSymbols();
      return data;
    } catch (error) {
      console.error('Error adding symbol:', error);
      toast({
        title: 'Error',
        description: 'Failed to add symbol',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSymbols();
  }, []);

  return {
    symbols,
    loading,
    fetchSymbols,
    addSymbol,
    refetch: fetchSymbols
  };
};
