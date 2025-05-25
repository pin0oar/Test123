
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface TradingViewWidgetProps {
  symbol: string;
}

export const TradingViewWidget = ({ symbol }: TradingViewWidgetProps) => {
  useEffect(() => {
    if (!symbol) return;

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
      "symbol": `NASDAQ:${symbol}`,
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
  }, [symbol]);

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
