
// Import necessary UI components and hooks
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { BarChart3, Wallet, Calculator, TrendingUp, Book, Settings, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Main sidebar component for navigation with modern blue theme
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
    // Main sidebar container with modern blue theme and smooth transitions
    <div className="w-64 bg-sidebar min-h-screen transition-colors duration-300">
      
      {/* Logo/Brand section at the top with modern styling */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          {/* App logo - circular blue background with "R" letter */}
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          {/* App name with sidebar text color */}
          <h1 className="text-xl font-semibold text-sidebar-foreground">
            {t('appName')}
          </h1>
        </div>
      </div>

      {/* Navigation menu with enhanced spacing and transitions */}
      <nav className="p-4 space-y-2">
        {/* Loop through each menu item and render as a styled button */}
        {menuItems.map((item) => {
          // Check if current route matches this menu item
          const isActive = location.pathname === item.href;
          
          return (
            // Link wrapper for navigation with smooth transitions
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost" // Transparent button style that adapts to sidebar theme
                className={`w-full justify-start h-11 px-4 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all duration-200 ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm border-r-2 border-primary' // Active state: primary background, white text, blue right border, subtle shadow
                    : '' // Inactive state: default styling with hover effects
                }`}
              >
                {/* Menu item icon with consistent sizing */}
                <item.icon className="h-5 w-5 mr-3" />
                {/* Menu item label with medium font weight */}
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
