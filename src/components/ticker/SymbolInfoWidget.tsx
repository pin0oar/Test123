
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface SymbolInfoWidgetProps {
  symbol: string;
  market?: string;
}

export const SymbolInfoWidget = ({ symbol, market }: SymbolInfoWidgetProps) => {
  useEffect(() => {
    if (!symbol) return;

    // Format symbol based on market
    let formattedSymbol = symbol;
    const isSaudiStock = (market && market.includes('Saudi')) || symbol.includes('.SR');
    
    if (isSaudiStock) {
      const cleanSymbol = symbol.replace(/[^0-9]/g, '');
      formattedSymbol = `TADAWUL:${cleanSymbol}`;
    } else {
      formattedSymbol = `NASDAQ:${symbol}`;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": formattedSymbol,
      "width": "100%",
      "locale": "ar_AE",
      "colorTheme": "light",
      "isTransparent": false
    });

    const widgetContainer = document.getElementById('symbol-info-widget');
    if (widgetContainer) {
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
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [symbol, market]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Symbol Information
      </h3>
      <div 
        id="symbol-info-widget" 
        className="tradingview-widget-container w-full"
      />
    </Card>
  );
};
