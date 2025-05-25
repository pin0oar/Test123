
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Holding } from '@/types/portfolio';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface HoldingsTableProps {
  holdings: (Holding & { portfolioName?: string })[];
}

export const HoldingsTable = ({ holdings }: HoldingsTableProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('allHoldings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Portfolio</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>P&L %</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Dividend Yield</TableHead>
                <TableHead>Halal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={`${holding.id}-${holding.lotId}`}>
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell>{holding.portfolioName}</TableCell>
                  <TableCell>{holding.market}</TableCell>
                  <TableCell>{holding.quantity.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(holding.avgPrice, holding.currency)}</TableCell>
                  <TableCell>{formatCurrency(holding.currentPrice, holding.currency)}</TableCell>
                  <TableCell>{formatCurrency(holding.totalValue, holding.currency)}</TableCell>
                  <TableCell className={holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(holding.pnl, holding.currency)}
                  </TableCell>
                  <TableCell className={holding.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(holding.pnlPercentage)}
                  </TableCell>
                  <TableCell>{holding.currency}</TableCell>
                  <TableCell>{formatPercentage(holding.dividendYield)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      holding.isHalal 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {holding.isHalal ? 'Halal' : 'Non-Halal'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
