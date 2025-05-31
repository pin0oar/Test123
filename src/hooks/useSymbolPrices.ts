
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SymbolPrice {
  id: string;
  symbol_id: string;
  symbol: string;
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
  currency: string;
}

export const useSymbolPrices = (symbolIds?: string[]) => {
  const [prices, setPrices] = useState<SymbolPrice[]>([]);
  const [pricesMap, setPricesMap] = useState<Record<string, SymbolPrice>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPrices = async () => {
    try {
      setLoading(true);
      console.log('Fetching symbol prices from new schema...');

      let query = supabase
        .from('symbol_prices')
        .select(`
          id,
          symbol_id,
          price,
          change_amount,
          change_percentage,
          volume,
          market_cap,
          high_52_week,
          low_52_week,
          dividend_yield,
          data_source,
          fetched_at,
          market_session,
          symbols!inner (
            symbol,
            currency
          )
        `)
        .order('fetched_at', { ascending: false });

      if (symbolIds && symbolIds.length > 0) {
        query = query.in('symbol_id', symbolIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedPrices: SymbolPrice[] = (data || []).map((item: any) => ({
        id: item.id,
        symbol_id: item.symbol_id,
        symbol: item.symbols.symbol,
        price: Number(item.price),
        change_amount: Number(item.change_amount),
        change_percentage: Number(item.change_percentage),
        volume: item.volume ? Number(item.volume) : undefined,
        market_cap: item.market_cap ? Number(item.market_cap) : undefined,
        high_52_week: item.high_52_week ? Number(item.high_52_week) : undefined,
        low_52_week: item.low_52_week ? Number(item.low_52_week) : undefined,
        dividend_yield: item.dividend_yield ? Number(item.dividend_yield) : undefined,
        data_source: item.data_source,
        fetched_at: item.fetched_at,
        market_session: item.market_session,
        currency: item.symbols.currency
      }));

      setPrices(transformedPrices);

      // Create a map for easy lookup by symbol
      const pricesMapData: Record<string, SymbolPrice> = {};
      transformedPrices.forEach(price => {
        pricesMapData[price.symbol] = price;
      });
      setPricesMap(pricesMapData);

      console.log('Fetched prices:', transformedPrices.length);
    } catch (error) {
      console.error('Error fetching symbol prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch symbol prices',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (symbolId: string, priceData: {
    price: number;
    change_amount: number;
    change_percentage: number;
    volume?: number;
    market_cap?: number;
    data_source: string;
    market_session?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('symbol_prices')
        .upsert([{
          symbol_id: symbolId,
          price: priceData.price,
          change_amount: priceData.change_amount,
          change_percentage: priceData.change_percentage,
          volume: priceData.volume,
          market_cap: priceData.market_cap,
          data_source: priceData.data_source,
          market_session: priceData.market_session || 'regular',
          fetched_at: new Date().toISOString()
        }], {
          onConflict: 'symbol_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;

      fetchPrices();
      return data;
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: 'Error',
        description: 'Failed to update price',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const getSymbolsForUpdate = async () => {
    try {
      const { data, error } = await supabase.rpc('get_symbols_for_price_update');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting symbols for update:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [symbolIds?.join(',')]);

  return {
    prices,
    pricesMap,
    loading,
    fetchPrices,
    updatePrice,
    getSymbolsForUpdate,
    refetch: fetchPrices
  };
};
