
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '@/types/portfolio';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/utils/formatters';

interface HoldingsChartsProps {
  holdings: (Holding & { portfolioName?: string })[];
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff',
  '#00ffff', '#ffff00', '#8b0000', '#008b8b', '#ff69b4', '#32cd32'
];

export const HoldingsCharts = ({ holdings }: HoldingsChartsProps) => {
  const { t } = useLanguage();

  // Holdings by value
  const holdingsByValue = holdings.map((holding, index) => ({
    name: holding.symbol,
    value: holding.totalValue,
    color: COLORS[index % COLORS.length]
  }));

  // Holdings by sector (mock data since we don't have sector info)
  const sectorData = holdings.reduce((acc, holding) => {
    // Mock sector assignment based on market or symbol patterns
    let sector = 'Technology';
    if (holding.market?.includes('Saudi')) {
      if (holding.symbol.includes('1')) sector = 'Banking';
      else if (holding.symbol.includes('2')) sector = 'Petrochemicals';
      else if (holding.symbol.includes('3')) sector = 'Real Estate';
      else sector = 'Other';
    } else {
      if (holding.symbol.includes('AAPL') || holding.symbol.includes('MSFT')) sector = 'Technology';
      else if (holding.symbol.includes('JPM') || holding.symbol.includes('BAC')) sector = 'Financial';
      else if (holding.symbol.includes('XOM') || holding.symbol.includes('CVX')) sector = 'Energy';
      else sector = 'Other';
    }

    const existing = acc.find(item => item.name === sector);
    if (existing) {
      existing.value += holding.totalValue;
    } else {
      acc.push({
        name: sector,
        value: holding.totalValue,
        color: COLORS[acc.length % COLORS.length]
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);

  // Holdings by market
  const marketData = holdings.reduce((acc, holding) => {
    const market = holding.market || 'Unknown';
    const existing = acc.find(item => item.name === market);
    if (existing) {
      existing.value += holding.totalValue;
    } else {
      acc.push({
        name: market,
        value: holding.totalValue,
        color: COLORS[acc.length % COLORS.length]
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {formatCurrency(data.value, 'USD')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Holdings by Value */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={holdingsByValue}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {holdingsByValue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Holdings by Sector */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Holdings by Market */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings by Market</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {marketData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
