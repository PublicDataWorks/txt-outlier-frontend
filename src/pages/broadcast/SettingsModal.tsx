import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Settings } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { BroadcastSettings } from '@/apis/settings';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { useSettingsQuery, useSettingsMutation } from '@/hooks/useSettings';
import { getESTorEDT } from '@/lib/date';
import { cn } from '@/lib/utils';

// Constants
const DAY_MAPPING = {
  sun: 'Su',
  mon: 'Mo',
  tue: 'Tu',
  wed: 'We',
  thu: 'Th',
  fri: 'Fr',
  sat: 'Sa',
} as const;

const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const MIN_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 10000;

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Form validation schema
const formSchema = z.object({
  schedule: z.record(z.string(), z.string().nullable()),
  batchSize: z.number()
    .min(MIN_BATCH_SIZE, `Batch size must be at least ${MIN_BATCH_SIZE}`)
    .max(MAX_BATCH_SIZE, `Batch size cannot exceed ${MAX_BATCH_SIZE}`),
});

const currentTimeZone = getESTorEDT();

export function SettingsModal() {
  const [open, setOpen] = React.useState(false);

  const { data: settings, isLoading } = useSettingsQuery();
  const { mutate: updateSettings, isPending: isSaving } = useSettingsMutation();

  const { toast } = useToast();

  const form = useForm<BroadcastSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  });

  const { handleSubmit, setValue, watch, formState: { errors } } = form;

  React.useLayoutEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);


  const handleDayToggle = React.useCallback((dayKey: string) => {
    const currentSchedule = watch('schedule');
    setValue('schedule', {
      ...currentSchedule,
      [dayKey]: currentSchedule[dayKey] ? null : '09:00',
    });
  }, [setValue, watch]);

  const handleTimeChange = React.useCallback((dayKey: string, time: string) => {
    setValue(`schedule.${dayKey}`, time);
  }, [setValue]);

  const onSubmit = async (data: BroadcastSettings) => {
    updateSettings(data, {
      onSuccess: () => {
        setOpen(false);
        toast({ description: 'Settings updated successfully' });
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to save settings. Please try again later!' });
      },
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-svw max-w-none rounded-none bg-background border border-input dark:bg-[#1E1E1E] dark:border-neutral-700">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-base">Broadcast Settings</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-foreground dark:text-white">Weekly Schedule</Label>
              <p className="text-sm text-muted-foreground dark:text-neutral-400">
                Select days and set times for each broadcast
              </p>
              <ToggleGroup type="multiple" variant="outline" className="justify-start">
                {DAYS_OF_WEEK.map((day) => (
                  <ToggleGroupItem
                    key={day}
                    value={day}
                    aria-label={DAY_MAPPING[day]}
                    className="w-9 h-9 rounded-full data-[state=on]:bg-[#2F80ED] data-[state=on]:text-white"
                    data-state={watch(`schedule.${day}`) ? 'on' : 'off'}
                    onClick={() => handleDayToggle(day)}
                  >
                    {DAY_MAPPING[day]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="grid gap-2 mt-2">
                {DAYS_OF_WEEK.map(
                  (day) =>
                    watch(`schedule.${day}`) !== null && (
                      <div key={day} className="flex items-center gap-2">
                        <Label htmlFor={`time-${day}`} className="w-8 dark:text-white">
                          {DAY_MAPPING[day]}
                        </Label>
                        <Select
                          value={watch(`schedule.${day}`) || '09:00'}
                          onValueChange={(value) => handleTimeChange(day, value)}
                        >
                          <SelectTrigger
                            id={`time-${day}`}
                            className="w-[180px] bg-background dark:bg-[#1E1E1E] border-input dark:border-neutral-600"
                          >
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="bg-background dark:bg-[#1E1E1E] border-input dark:border-neutral-700">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem
                                key={`${day}-${time}`}
                                value={time}
                                className="dark:text-white dark:focus:bg-neutral-600"
                              >
                                {`${time} ${currentTimeZone}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batchSize" className="dark:text-white">
                Batch Size
              </Label>
              <p className="text-sm text-muted-foreground dark:text-neutral-400">
                Number of recipients per batch ({MIN_BATCH_SIZE}-{MAX_BATCH_SIZE})
              </p>
              <Input
                {...form.register('batchSize', { valueAsNumber: true })}
                id="batchSize"
                type="number"
                className={cn(
                  'bg-background dark:bg-[#1E1E1E] border-input dark:border-neutral-600',
                  errors.batchSize && 'border-red-500'
                )}
                min={MIN_BATCH_SIZE}
                max={MAX_BATCH_SIZE}
              />
              {errors.batchSize && (
                <p className="text-sm text-red-400">{errors.batchSize.message}</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 bg-input hover:bg-input/50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] text-white"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
