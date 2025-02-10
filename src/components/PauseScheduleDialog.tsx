import { DialogTrigger } from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedDate, setSelectedDate] = React.useState<Date>(currentDate);

  const { toast } = useToast();

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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update schedule. Please try again!',
      });
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
      <DialogContent className="bg-background border border-input dark:bg-[#1E1E1E] dark:border-neutral-700">
        <DialogDescription />
        <DialogHeader>
          <DialogTitle className="text-base">Pause schedule</DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-neutral-400" />
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              fromDate={new Date()}
              className="rounded-lg border border-input bg-background dark:border-neutral-700 dark:bg-[#1E1E1E]"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full bg-background dark:bg-[#1E1E1E]',
                caption: 'flex justify-center pt-1 relative items-center text-muted-foreground dark:text-neutral-200',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-input/50 rounded-md dark:hover:bg-neutral-700',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex justify-between px-2 border-b border-input dark:border-neutral-700',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-sm dark:text-neutral-400',
                row: 'flex w-full mt-2 justify-between px-2',
                cell: 'text-center text-sm p-0 relative hover:bg-input/50 dark:hover:bg-neutral-700',
                day: 'h-9 w-9 p-0 font-normal rounded-md text-muted-foreground dark:text-neutral-300',
                day_range_end: 'rounded-r-md',
                day_range_start: 'rounded-l-md',
                day_selected: 'bg-[#2F80ED] text-white hover:bg-[#2D7BE5] rounded-md dark:bg-[#2F80ED] dark:text-white',
                day_today: 'bg-input/50 text-muted-foreground dark:bg-neutral-700 dark:text-neutral-200',
                day_outside: 'text-muted-foreground opacity-50 dark:text-neutral-500',
                day_disabled: 'text-muted-foreground opacity-50 dark:text-neutral-500',
                day_range_middle: 'bg-accent/50 dark:bg-accent/50',
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
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Pause batch schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
