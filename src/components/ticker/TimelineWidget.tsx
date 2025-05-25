
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface TimelineWidgetProps {
  symbol: string;
  market?: string;
}

export const TimelineWidget = ({ symbol, market }: TimelineWidgetProps) => {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "feedMode": "symbol",
      "symbol": formattedSymbol,
      "isTransparent": false,
      "displayMode": "regular",
      "width": "100%",
      "height": 550,
      "colorTheme": "light",
      "locale": "ar_AE"
    });

    const widgetContainer = document.getElementById('timeline-widget');
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
        News & Timeline
      </h3>
      <div 
        id="timeline-widget" 
        className="tradingview-widget-container w-full"
      />
    </Card>
  );
};
