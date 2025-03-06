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

interface FutureDatePickerProps {
  value?: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  modal?: boolean;
}

export function FutureDatePicker({
  value,
  onChange,
  disabled,
  modal = true,
}: FutureDatePickerProps) {
  const today = new Date();

  return (
    <Popover modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'flex justify-between text-left font-normal h-10 w-full',
            !value && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          {value ? (
            <span>{format(value, 'LLL dd, y')}</span>
          ) : (
            <span>dd/mm/yyyy</span>
          )}
          <CalendarIcon className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Calendar
          initialFocus
          mode="single"
          defaultMonth={value || today}
          selected={value}
          onSelect={onChange}
          disabled={(date) => date < today}
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
