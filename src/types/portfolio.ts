
export interface Holding {
  id: string;
  symbol: string;
  name: string;
  market: string; // TADAWUL, NYSE, NASDAQ, etc.
  lotId: string; // New field to support multiple lots of the same stock
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  currency: string;
  isHalal: boolean;
  dividendYield: number;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  holdings: Holding[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  createdAt: Date;
  lastUpdated: Date;
}

export interface DividendPayment {
  id: string;
  holdingId: string;
  symbol: string;
  amount: number;
  currency: string;
  exDate: Date;
  payDate: Date;
  isProjected: boolean;
}

export interface ZakatCalculation {
  portfolioId: string;
  totalValue: number;
  zakatableAmount: number;
  zakatDue: number;
  zakatRate: number; // Usually 2.5%
  calculationDate: Date;
}

export interface PriceHistory {
  id: string;
  symbol: string;
  price: number;
  currency: string;
  recordedAt: Date;
  source: string;
}
