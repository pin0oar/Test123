
// Import necessary UI components and hooks
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { BarChart3, Wallet, Calculator, TrendingUp, Book, Settings, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Main sidebar component for navigation
export const ModernSidebar = () => {
  // Get translation function from language hook
  const { t } = useLanguage();
  
  // Get current location to highlight active menu item
  const location = useLocation();

  // Define menu items with their icons, labels, and routes
  const menuItems = [
    { icon: BarChart3, label: t('dashboard'), href: '/' },
    { icon: Wallet, label: t('portfolios'), href: '/portfolios' },
    { icon: PieChart, label: t('holdings'), href: '/holdings' },
    { icon: TrendingUp, label: t('dividends'), href: '/dividends' },
    { icon: Calculator, label: t('zakat'), href: '/zakat' },
    { icon: Book, label: t('research'), href: '/research' },
    { icon: Settings, label: t('settings'), href: '/settings' },
  ];

  return (
    // Main sidebar container with dark background and full height
    <div className="w-64 bg-slate-700 min-h-screen">
      
      {/* Logo/Brand section at the top */}
      <div className="p-6 border-b border-slate-600">
        <div className="flex items-center space-x-3">
          {/* App logo - circular emerald background with "R" */}
          <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          {/* App name */}
          <h1 className="text-xl font-semibold text-white">
            {t('appName')}
          </h1>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="p-4 space-y-2">
        {/* Loop through each menu item and render as a button */}
        {menuItems.map((item) => {
          // Check if current route matches this menu item
          const isActive = location.pathname === item.href;
          
          return (
            // Link wrapper for navigation
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost" // Transparent button style
                className={`w-full justify-start h-11 px-4 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors ${
                  isActive 
                    ? 'bg-slate-600 text-white border-r-2 border-emerald-400' // Active state: darker background, white text, emerald right border
                    : '' // Inactive state: default styling
                }`}
              >
                {/* Menu item icon */}
                <item.icon className="h-5 w-5 mr-3" />
                {/* Menu item label */}
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
