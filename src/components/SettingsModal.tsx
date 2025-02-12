import { DialogDescription } from '@radix-ui/react-dialog';
import { Settings } from 'lucide-react';
import * as React from 'react';

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
import { cn } from '@/lib/utils';

// Types and Interfaces
interface BackendSchedule {
  schedule: {
    [key: string]: string | null;
  };
  batchSize: number;
}

interface DaySchedule {
  enabled: boolean;
  time: string;
}

interface BroadcastSettings {
  schedule: {
    [key: string]: DaySchedule;
  };
  batchSize: number;
}

interface SettingsModalProps {
  initialSettings?: BackendSchedule;
  onSave: (settings: BackendSchedule) => Promise<void>;
  onError?: (error: Error) => void;
}

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

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const DEFAULT_TIME = '09:00';
const MIN_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 10000;

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Default settings
const DEFAULT_SETTINGS: BackendSchedule = {
  schedule: {
    mon: '10:30',
    tue: null,
    wed: '11:15',
    thu: null,
    fri: null,
    sat: '09:00',
    sun: '10:00',
  },
  batchSize: 500,
};

// Utility functions
const convertBackendToFrontend = (backendData: BackendSchedule): BroadcastSettings => {
  const schedule: { [key: string]: DaySchedule } = {};

  Object.entries(DAY_MAPPING).forEach(([backendDay, frontendDay]) => {
    const time = backendData.schedule[backendDay];
    schedule[frontendDay] = {
      enabled: time !== null,
      time: time || DEFAULT_TIME,
    };
  });

  return {
    schedule,
    batchSize: backendData.batchSize,
  };
};

const convertFrontendToBackend = (frontendData: BroadcastSettings): BackendSchedule => {
  const schedule: { [key: string]: string | null } = {};

  Object.entries(DAY_MAPPING).forEach(([backendDay, frontendDay]) => {
    const daySchedule = frontendData.schedule[frontendDay];
    schedule[backendDay] = daySchedule.enabled ? daySchedule.time : null;
  });

  return {
    schedule,
    batchSize: frontendData.batchSize,
  };
};

const validateBatchSize = (value: number): string | null => {
  if (isNaN(value)) return 'Batch size must be a number';
  if (value < MIN_BATCH_SIZE) return `Batch size must be at least ${MIN_BATCH_SIZE}`;
  if (value > MAX_BATCH_SIZE) return `Batch size cannot exceed ${MAX_BATCH_SIZE}`;
  return null;
};

export function SettingsModal({ initialSettings = DEFAULT_SETTINGS, onSave, onError }: SettingsModalProps) {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<BroadcastSettings>(() =>
    convertBackendToFrontend(initialSettings)
  );
  const [batchSizeError, setBatchSizeError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleDayToggle = React.useCallback((day: string) => {
    setSettings((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          enabled: !prev.schedule[day].enabled,
        },
      },
    }));
  }, []);

  const handleTimeChange = React.useCallback((day: string, time: string) => {
    setSettings((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          time,
        },
      },
    }));
  }, []);

  const handleBatchSizeChange = React.useCallback((value: string) => {
    const batchSize = Number.parseInt(value, 10);
    const error = validateBatchSize(batchSize);
    setBatchSizeError(error);
    setSettings((prev) => ({ ...prev, batchSize }));
  }, []);

  const handleSave = async () => {
    if (batchSizeError) return;

    try {
      setIsSaving(true);
      const backendSettings = convertFrontendToBackend(settings);
      await onSave(backendSettings);
      setOpen(false);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to save settings'));
    } finally {
      setIsSaving(false);
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
            <Label className="text-foreground dark:text-white">Weekly Schedule</Label>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              Select days and set times for each broadcast
            </p>
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
                              key={`${day}-${time}`}
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
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              Number of recipients per batch ({MIN_BATCH_SIZE}-{MAX_BATCH_SIZE})
            </p>
            <Input
              id="batchSize"
              type="number"
              value={settings.batchSize}
              onChange={(e) => handleBatchSizeChange(e.target.value)}
              className={cn(
                'bg-background dark:bg-[#1E1E1E] border-input dark:border-neutral-600',
                batchSizeError && 'border-red-500'
              )}
              min={MIN_BATCH_SIZE}
              max={MAX_BATCH_SIZE}
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
