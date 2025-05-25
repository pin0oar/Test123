
import { useEffect } from 'react';

interface SymbolProfileWidgetProps {
  symbol: string;
  market?: string;
}

export const SymbolProfileWidget = ({ symbol, market }: SymbolProfileWidgetProps) => {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": 550,
      "isTransparent": false,
      "colorTheme": "light",
      "symbol": formattedSymbol,
      "locale": "ar_AE"
    });

    const widgetContainer = document.getElementById('symbol-profile-widget');
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
    <div 
      id="symbol-profile-widget" 
      className="tradingview-widget-container w-full"
    />
  );
};
