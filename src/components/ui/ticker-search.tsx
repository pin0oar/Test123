
import React, { useState, useEffect, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useYahooFinance } from '@/hooks/useYahooFinance';
import { debounce } from '@/utils/debounce';

interface TickerSearchProps {
  value?: string;
  onSelect: (ticker: { symbol: string; name: string; exchange: string }) => void;
  placeholder?: string;
  className?: string;
}

export const TickerSearch = ({ value, onSelect, placeholder = "Search for stocks...", className }: TickerSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tickers, setTickers] = useState<any[]>([]);
  const { searchTickers, loading } = useYahooFinance();

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        const results = await searchTickers(query);
        setTickers(results);
      } else {
        setTickers([]);
      }
    }, 300),
    [searchTickers]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search tickers..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : searchQuery.length < 2 ? "Type at least 2 characters" : "No tickers found."}
            </CommandEmpty>
            <CommandGroup>
              {tickers.map((ticker) => (
                <CommandItem
                  key={ticker.symbol}
                  value={ticker.symbol}
                  onSelect={() => {
                    onSelect({
                      symbol: ticker.symbol,
                      name: ticker.shortname || ticker.longname,
                      exchange: ticker.exchDisp || ticker.exchange
                    });
                    setOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === ticker.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{ticker.symbol}</span>
                    <span className="text-sm text-gray-500">
                      {ticker.shortname || ticker.longname} • {ticker.exchDisp || ticker.exchange}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
