
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { BarChart3, Wallet, Calculator, TrendingUp, Book, Settings, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const ModernSidebar = () => {
  const { t } = useLanguage();
  const location = useLocation();

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
    <div className="w-64 bg-slate-700 min-h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-600">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-xl font-semibold text-white">
            {t('appName')}
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-11 px-4 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors ${
                  isActive 
                    ? 'bg-slate-600 text-white border-r-2 border-emerald-400' 
                    : ''
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
