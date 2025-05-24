
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { BarChart3, Wallet, Calculator, TrendingUp, Book, Settings } from 'lucide-react';

interface NavigationMenuProps {
  isMobile?: boolean;
}

export const NavigationMenu = ({ isMobile = false }: NavigationMenuProps) => {
  const { t } = useLanguage();

  const menuItems = [
    { icon: BarChart3, label: t('dashboard'), href: '/' },
    { icon: Wallet, label: t('portfolios'), href: '/portfolios' },
    { icon: TrendingUp, label: t('dividends'), href: '/dividends' },
    { icon: Calculator, label: t('zakat'), href: '/zakat' },
    { icon: Book, label: t('research'), href: '/research' },
    { icon: Settings, label: t('settings'), href: '/settings' },
  ];

  if (isMobile) {
    return (
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start"
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-1">
      {menuItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className="text-sm"
        >
          <item.icon className="h-4 w-4 mr-1" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
};
