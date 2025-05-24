
import { useState, useCallback } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  appName: {
    en: 'Riyal Track',
    ar: 'تتبع الريال'
  },
  dashboard: {
    en: 'Dashboard',
    ar: 'لوحة التحكم'
  },
  portfolios: {
    en: 'Portfolios',
    ar: 'المحافظ'
  },
  dividends: {
    en: 'Dividends',
    ar: 'الأرباح'
  },
  zakat: {
    en: 'Zakat',
    ar: 'الزكاة'
  },
  research: {
    en: 'Research',
    ar: 'البحث'
  },
  settings: {
    en: 'Settings',
    ar: 'الإعدادات'
  },
  menu: {
    en: 'Menu',
    ar: 'القائمة'
  },
  theme: {
    en: 'Theme',
    ar: 'المظهر'
  },
  totalValue: {
    en: 'Total Value',
    ar: 'القيمة الإجمالية'
  },
  totalPnL: {
    en: 'Total P&L',
    ar: 'الربح والخسارة'
  },
  myPortfolios: {
    en: 'My Portfolios',
    ar: 'محافظي'
  },
  holdings: {
    en: 'holdings',
    ar: 'حيازة'
  },
  noPortfolios: {
    en: 'No Portfolios Yet',
    ar: 'لا توجد محافظ بعد'
  },
  createFirstPortfolio: {
    en: 'Create your first portfolio to start tracking your investments',
    ar: 'أنشئ محفظتك الأولى لبدء تتبع استثماراتك'
  },
  createPortfolio: {
    en: 'Create Portfolio',
    ar: 'إنشاء محفظة'
  },
  addPortfolio: {
    en: 'Add Portfolio',
    ar: 'إضافة محفظة'
  },
  quickActions: {
    en: 'Quick Actions',
    ar: 'الإجراءات السريعة'
  },
  addHolding: {
    en: 'Add Holding',
    ar: 'إضافة حيازة'
  },
  addHoldingDesc: {
    en: 'Add a new stock to your portfolio',
    ar: 'أضف سهماً جديداً إلى محفظتك'
  },
  calculateZakat: {
    en: 'Calculate Zakat',
    ar: 'حساب الزكاة'
  },
  calculateZakatDesc: {
    en: 'Calculate zakat on your investments',
    ar: 'احسب الزكاة على استثماراتك'
  },
  trackDividends: {
    en: 'Track Dividends',
    ar: 'تتبع الأرباح'
  },
  trackDividendsDesc: {
    en: 'Monitor your dividend income',
    ar: 'راقب دخل الأرباح الموزعة'
  },
  researchDesc: {
    en: 'Research stocks and markets',
    ar: 'ابحث عن الأسهم والأسواق'
  },
  marketOverview: {
    en: 'Market Overview',
    ar: 'نظرة عامة على السوق'
  },
  delayedData: {
    en: '15-20 min delayed data',
    ar: 'بيانات مؤجلة 15-20 دقيقة'
  },
  recentActivity: {
    en: 'Recent Activity',
    ar: 'النشاط الأخير'
  },
  addedHolding: {
    en: 'Added Holding',
    ar: 'إضافة حيازة'
  },
  zakatCalculated: {
    en: 'Zakat Calculated',
    ar: 'تم حساب الزكاة'
  },
  portfolioZakat: {
    en: 'Portfolio Zakat',
    ar: 'زكاة المحفظة'
  },
  dividendReceived: {
    en: 'Dividend Received',
    ar: 'تم استلام الأرباح'
  },
  portfolioUpdate: {
    en: 'Portfolio Update',
    ar: 'تحديث المحفظة'
  },
  gainToday: {
    en: '+2.5% gain today',
    ar: '+2.5% ربح اليوم'
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    return translation ? translation[language] : key;
  }, [language]);

  return {
    language,
    toggleLanguage,
    t,
    isRTL: language === 'ar'
  };
};
