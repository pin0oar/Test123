
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TickerHeaderProps {
  symbol: string;
  name: string;
}

export const TickerHeader = ({ symbol, name }: TickerHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Link to="/">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {symbol}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {name}
        </p>
      </div>
    </div>
  );
};
