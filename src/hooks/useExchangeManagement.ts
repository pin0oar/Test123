
import { supabase } from '@/integrations/supabase/client';

export const useExchangeManagement = () => {
  const getOrCreateExchange = async (exchangeCode: string, currency: string) => {
    // Get exchange
    const { data: exchange, error: exchangeError } = await supabase
      .from('exchanges')
      .select('id')
      .eq('code', exchangeCode)
      .maybeSingle();

    if (exchangeError && !exchangeError.message.includes('No rows found')) {
      throw exchangeError;
    }

    if (exchange) {
      return exchange.id;
    }

    // Create exchange if it doesn't exist
    const { data: newExchange, error: createError } = await supabase
      .from('exchanges')
      .insert([{
        code: exchangeCode,
        name: exchangeCode,
        country: exchangeCode === 'TADAWUL' ? 'SA' : exchangeCode === 'LSE' ? 'GB' : 'US',
        currency: currency || 'USD',
        timezone: exchangeCode === 'TADAWUL' ? 'Asia/Riyadh' : exchangeCode === 'LSE' ? 'Europe/London' : 'America/New_York'
      }])
      .select('id')
      .single();

    if (createError) throw createError;
    return newExchange.id;
  };

  return {
    getOrCreateExchange
  };
};
