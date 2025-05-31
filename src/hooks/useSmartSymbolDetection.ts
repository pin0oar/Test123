
export interface SymbolInfo {
  exchangeCode: string;
  currency: string;
  symbolType: 'stock' | 'crypto' | 'index' | 'etf';
}

export const detectSymbolInfo = (symbol: string): SymbolInfo => {
  const upperSymbol = symbol.toUpperCase();
  
  // Cryptocurrency detection
  if (upperSymbol.includes('-USD') || upperSymbol.includes('-USDT') || upperSymbol.includes('-BTC')) {
    return {
      exchangeCode: 'CRYPTO',
      currency: 'USD',
      symbolType: 'crypto'
    };
  }
  
  // Saudi Arabia (Tadawul) detection
  if (upperSymbol.endsWith('.SR') || upperSymbol.length === 4 && /^\d+$/.test(upperSymbol)) {
    return {
      exchangeCode: 'TADAWUL',
      currency: 'SAR',
      symbolType: 'stock'
    };
  }
  
  // London Stock Exchange
  if (upperSymbol.endsWith('.L') || upperSymbol.endsWith('.LON')) {
    return {
      exchangeCode: 'LSE',
      currency: 'GBP',
      symbolType: 'stock'
    };
  }
  
  // Index detection
  if (upperSymbol.startsWith('^') || ['SPY', 'QQQ', 'DIA', 'IWM'].includes(upperSymbol)) {
    return {
      exchangeCode: 'INDEX',
      currency: 'USD',
      symbolType: 'index'
    };
  }
  
  // Default to NYSE for US stocks
  return {
    exchangeCode: 'NYSE',
    currency: 'USD',
    symbolType: 'stock'
  };
};
