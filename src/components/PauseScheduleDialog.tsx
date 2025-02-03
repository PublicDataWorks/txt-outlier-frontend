import { DialogTrigger } from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import * as React from 'react';

import { LoadingSpinner } from './ui/loading-spinner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PauseScheduleModalProps {
  onConfirm: (runAt: number) => Promise<void> | void;
  currentDate: Date;
}

export default function PauseScheduleDialog({
  onConfirm,
  currentDate,
}: PauseScheduleModalProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date(currentDate.toDateString()),
  );

  const onClose = () => setOpen(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const timeUnix =
        currentDate.getHours() * 60 * 60 +
        currentDate.getMinutes() * 60 +
        currentDate.getSeconds();

      const newRunAt = Math.floor(
        (selectedDate.getTime() + timeUnix * 1000) / 1000,
      );

      await onConfirm(newRunAt);
      onClose();
    } catch (error) {
      console.error('Error while confirming:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="flex-1 gap-2 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
        >
          Pause schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="border-neutral-700 bg-[#2A2A2A] text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Pause schedule
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              fromDate={new Date()}
              className="rounded-lg border-neutral-600 bg-[#1E1E1E]"
              classNames={{
                months:
                  'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full',
                caption:
                  'flex justify-center pt-1 relative items-center text-white',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button:
                  'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-neutral-700 rounded-md text-white',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex justify-between px-2',
                head_cell:
                  'text-neutral-400 rounded-md w-9 font-normal text-sm',
                row: 'flex w-full mt-2 justify-between px-2',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal text-white aria-selected:opacity-100 hover:bg-neutral-700 rounded-md',
                day_range_end: 'day-range-end',
                day_range_start: 'day-range-start',
                day_selected:
                  'bg-[#2F80ED] text-white hover:bg-[#2D7BE5] hover:text-white focus:bg-[#2D7BE5] focus:text-white',
                day_today: 'bg-neutral-700 text-white',
                day_outside:
                  'text-neutral-600 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                day_disabled: 'text-neutral-600 opacity-50',
                day_range_middle:
                  'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
              }}
            />
          </div>
          <p className="mt-4 text-center text-sm text-neutral-400">
            Next batch will send on {format(selectedDate, 'MM/dd/yyyy')}
          </p>
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-[#2F80ED] text-white hover:bg-[#2D7BE5]"
            onClick={handleConfirm}
            disabled={
              isLoading || selectedDate.getTime() === currentDate.getTime()
            }
          >
            {isLoading ? <LoadingSpinner /> : 'Pause batch schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
