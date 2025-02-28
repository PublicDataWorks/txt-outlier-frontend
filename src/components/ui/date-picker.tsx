import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'flex justify-center text-left font-normal h-10 max-w-[150px]',
            !value && 'text-muted-foreground',
            value ? 'w-[240px]' : 'w-9 px-0',
          )}
          disabled={disabled}
        >
          <CalendarIcon className="h-4 w-4" />
          {value && <span className="ml-2">{format(value, 'LLL dd, y')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Calendar
          initialFocus
          mode="single"
          defaultMonth={value}
          selected={value}
          onSelect={onChange}
          disabled={(date) => date > new Date()}
          numberOfMonths={1}
        />
        {value && (
          <div className="flex items-center gap-2 p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onChange(undefined)}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
