
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  const currencySymbols: { [key: string]: string } = {
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || currency;
  
  if (currency === 'SAR') {
    return `${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} ${symbol}`;
  }
  
  return `${symbol}${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = 'SAR'): number => {
  // Mock exchange rates - in real app this would come from API
  const exchangeRates: { [key: string]: number } = {
    'USD_SAR': 3.75,
    'EUR_SAR': 4.10,
    'GBP_SAR': 4.65,
    'SAR_USD': 0.27,
    'SAR_EUR': 0.24,
    'SAR_GBP': 0.21
  };

  if (fromCurrency === toCurrency) return amount;
  
  const rateKey = `${fromCurrency}_${toCurrency}`;
  const rate = exchangeRates[rateKey] || 1;
  
  return amount * rate;
};
