
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface TradingViewWidgetProps {
  symbol: string;
  market?: string;
}

export const TradingViewWidget = ({ symbol, market }: TradingViewWidgetProps) => {
  useEffect(() => {
    if (!symbol) return;

    console.log('TradingViewWidget - symbol:', symbol);
    console.log('TradingViewWidget - market:', market);

    // Format symbol based on market
    let formattedSymbol = symbol;
    
    // Check if it's a Saudi stock - either by market info or symbol format
    const isSaudiStock = (market && market.includes('Saudi')) || symbol.includes('.SR');
    
    console.log('TradingViewWidget - isSaudiStock:', isSaudiStock);
    
    if (isSaudiStock) {
      // Remove anything after digits and add TADAWUL prefix
      const cleanSymbol = symbol.replace(/[^0-9]/g, '');
      formattedSymbol = `TADAWUL:${cleanSymbol}`;
      console.log('TradingViewWidget - cleanSymbol:', cleanSymbol);
      console.log('TradingViewWidget - formattedSymbol:', formattedSymbol);
    } else {
      formattedSymbol = `NASDAQ:${symbol}`;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "isTransparent": true,
      "largeChartUrl": "",
      "displayMode": "adaptive",
      "width": "100%",
      "height": 800,
      "colorTheme": "light",
      "symbol": formattedSymbol,
      "locale": "ar_AE"
    });

    const widgetContainer = document.getElementById('tradingview-widget');
    if (widgetContainer) {
      // Clear existing content
      widgetContainer.innerHTML = '';
      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      widgetContainer.appendChild(widgetDiv);
      const copyrightDiv = document.createElement('div');
      copyrightDiv.className = 'tradingview-widget-copyright';
      copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
      widgetContainer.appendChild(copyrightDiv);
      widgetContainer.appendChild(script);
    }

    return () => {
      // Cleanup script when component unmounts or symbol changes
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol, market]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Financial Data & Charts
      </h3>
      <div 
        id="tradingview-widget" 
        className="tradingview-widget-container w-full"
      />
    </Card>
  );
};
