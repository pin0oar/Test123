
import { useEffect } from 'react';

interface TechnicalAnalysisWidgetProps {
  symbol: string;
  market?: string;
}

export const TechnicalAnalysisWidget = ({ symbol, market }: TechnicalAnalysisWidgetProps) => {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "interval": "1m",
      "width": "100%",
      "isTransparent": false,
      "height": 450,
      "symbol": formattedSymbol,
      "showIntervalTabs": true,
      "displayMode": "single",
      "locale": "ar_AE",
      "colorTheme": "light"
    });

    const widgetContainer = document.getElementById('technical-analysis-widget');
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
      id="technical-analysis-widget" 
      className="tradingview-widget-container w-full"
    />
  );
};
