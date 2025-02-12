import { DialogDescription } from '@radix-ui/react-dialog';
import { Settings } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  onSave: (settings: BroadcastSettings) => Promise<void> | void;
}

export interface DaySchedule {
  enabled: boolean;
  time: string;
}

export interface BroadcastSettings {
  schedule: {
    [key: string]: DaySchedule
  };
  batchSize: number;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const sampleSettings: BroadcastSettings = {
  schedule: {
    'Su': { enabled: true, time: '09:00' },
    'Mo': { enabled: true, time: '10:30' },
    'Tu': { enabled: false, time: '14:00' },
    'We': { enabled: true, time: '15:45' },
    'Th': { enabled: false, time: '11:15' },
    'Fr': { enabled: true, time: '16:00' },
    'Sa': { enabled: false, time: '13:30' }
  },
  batchSize: 500
};

export function SettingsModal({ onSave }: SettingsModalProps) {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<BroadcastSettings>(sampleSettings);
  const [batchSizeError, setBatchSizeError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleDayToggle = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          enabled: !prev.schedule[day].enabled
        }
      }
    }));
  };

  const handleTimeChange = (day: string, time: string) => {
    setSettings((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          time: time
        }
      }
    }));
  };

  const handleBatchSizeChange = (value: string) => {
    const batchSize = Number.parseInt(value, 10);
    if (isNaN(batchSize) || batchSize < 100) {
      setBatchSizeError('Batch size must be at least 100');
    } else {
      setBatchSizeError(null);
    }
    setSettings((prev) => ({ ...prev, batchSize }));
  };

  const handleSave = async () => {
    if (!batchSizeError) {
      try {
        setIsSaving(true);
        await onSave(settings);
        setOpen(false);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-svw max-w-none rounded-none bg-background border border-input dark:bg-[#1E1E1E] dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-base">Broadcast Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-neutral-400">
            Configure your broadcast schedule and batch size settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-foreground dark:text-white">
              Weekly Schedule
            </Label>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">Select days and set times for each broadcast</p>
            <ToggleGroup type="multiple" variant="outline" className="justify-start">
              {DAYS_OF_WEEK.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  aria-label={day}
                  className="w-9 h-9 rounded-full data-[state=on]:bg-[#2F80ED] data-[state=on]:text-white"
                  data-state={settings.schedule[day].enabled ? 'on' : 'off'}
                  onClick={() => handleDayToggle(day)}
                >
                  {day}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="grid gap-2 mt-2">
              {DAYS_OF_WEEK.map(
                (day) =>
                  settings.schedule[day].enabled && (
                    <div key={day} className="flex items-center gap-2">
                      <Label htmlFor={`time-${day}`} className="w-8 dark:text-white">
                        {day}
                      </Label>
                      <Select
                        value={settings.schedule[day].time}
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
                              key={time}
                              value={time}
                              className="dark:text-white dark:focus:bg-neutral-600"
                            >
                              {time}
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
            <p className="text-sm text-muted-foreground dark:text-neutral-400">Number of recipients per batch</p>
            <Input
              id="batchSize"
              type="number"
              value={settings.batchSize}
              onChange={(e) => handleBatchSizeChange(e.target.value)}
              className={cn(
                'bg-background dark:bg-[#1E1E1E] border-input dark:border-neutral-600',
                batchSizeError && 'border-red-500'
              )}
            />
            {batchSizeError && <p className="text-sm text-red-400">{batchSizeError}</p>}
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
            onClick={handleSave}
            disabled={!!batchSizeError || isSaving}
            className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] text-white"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
