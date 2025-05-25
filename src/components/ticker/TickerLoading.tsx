
import { Header } from '@/components/layout/Header';

export const TickerLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading ticker data...</p>
        </div>
      </main>
    </div>
  );
};
