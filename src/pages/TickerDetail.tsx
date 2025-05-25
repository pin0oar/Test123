
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  currency: string;
  last_updated: string;
  market?: string;
}

const TickerDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { t } = useLanguage();
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickerData = async () => {
      if (!symbol) return;
      
      try {
        console.log('Fetching ticker data for:', symbol);
        
        const { data, error } = await supabase
          .from('tickers_data')
          .select('*')
          .eq('symbol', symbol.toUpperCase())
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching ticker data:', error);
          return;
        }

        if (data) {
          setTickerData({
            symbol: data.symbol,
            name: data.name,
            price: Number(data.price),
            change_amount: Number(data.change_amount),
            change_percentage: Number(data.change_percentage),
            currency: data.currency,
            last_updated: data.last_updated,
            market: data.market
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
  }, [symbol]);

  // Load TradingView widget script
  useEffect(() => {
    if (!tickerData) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "isTransparent": false,
      "largeChartUrl": "",
      "displayMode": "regular",
      "width": "100%",
      "height": 550,
      "colorTheme": "dark",
      "symbol": `NASDAQ:${tickerData.symbol}`,
      "locale": "en"
    });

    const widgetContainer = document.getElementById('tradingview-widget');
    if (widgetContainer) {
      // Clear existing content
      widgetContainer.innerHTML = '';
      // Add widget container
      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      widgetContainer.appendChild(widgetDiv);
      // Add copyright
      const copyrightDiv = document.createElement('div');
      copyrightDiv.className = 'tradingview-widget-copyright';
      copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
      widgetContainer.appendChild(copyrightDiv);
      // Add script
      widgetContainer.appendChild(script);
    }

    return () => {
      // Cleanup script when component unmounts or symbol changes
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [tickerData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading ticker data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!tickerData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ticker Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No data found for ticker symbol: {symbol}
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isPositive = tickerData.change_amount >= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tickerData.symbol}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {tickerData.name}
            </p>
          </div>
        </div>

        {/* Main ticker info */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Current Price
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(tickerData.price, tickerData.currency)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Change
              </h3>
              <div className="flex items-center space-x-2">
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className={`text-lg font-semibold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{formatCurrency(tickerData.change_amount, tickerData.currency)}
                  </p>
                  <p className={`text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? '+' : ''}{tickerData.change_percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {tickerData.market && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Market
                </h3>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {tickerData.market}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Last Updated
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(tickerData.last_updated).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* TradingView Widget */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Data & Charts
          </h3>
          <div 
            id="tradingview-widget" 
            className="tradingview-widget-container w-full"
          />
        </Card>

        {/* Placeholder for future features */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Information
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            More detailed ticker information and charts coming soon...
          </p>
        </Card>
      </main>
    </div>
  );
};

export default TickerDetail;
