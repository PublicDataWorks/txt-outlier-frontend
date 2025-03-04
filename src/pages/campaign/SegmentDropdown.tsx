import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SegmentOption {
  id: string;
  name: string;
}

interface SegmentDropdownProps {
  segment: string;
  timeframe: Date | undefined;
  onChange: (segment: string, timeframe: Date | undefined) => void;
  segments: SegmentOption[];
  disabled?: boolean;
}

const formatTimeframe = (timeframe: Date | undefined) => {
  if (!timeframe) return 'Any time';
  return `Added to segment since ${timeframe.toLocaleDateString()}`;
};

export default function SegmentDropdown({
  segment,
  timeframe,
  onChange,
  segments,
  disabled = false,
}: SegmentDropdownProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-row gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between overflow-auto"
              disabled={disabled}
            >
              <span className="truncate">
                {segment
                  ? segments.find((s) => s.id === segment)?.name || 'Unknown segment'
                  : 'Select segment...'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search segment..." />
              <CommandList>
                <CommandEmpty>No segment found.</CommandEmpty>
                <CommandGroup>
                  {segments.map((s) => (
                    <CommandItem
                      key={s.id}
                      onSelect={() => {
                        onChange(s.id, timeframe);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          segment === s.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {s.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DatePicker
          value={timeframe}
          onChange={(value) => onChange(segment, value)}
          disabled={!segment || disabled}
        />
      </div>
      {timeframe && (
        <p className="text-sm text-muted-foreground ml-2">
          {formatTimeframe(timeframe)}
        </p>
      )}
    </div>
  );
}
