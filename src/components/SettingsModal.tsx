'use client';

import { Settings } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { convertFromET, convertToET } from '@/lib/date.ts';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  initialSettings: BroadcastSettings;
  userTimeZone: string;
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

export function SettingsModal({ initialSettings, userTimeZone, onSave }: SettingsModalProps) {
  const [open, setOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<BroadcastSettings>(initialSettings);
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
          time: convertToET(time)
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
      <DialogContent className="sm:max-w-[425px] bg-[#2A2A2A] border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Broadcast Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="schedule" className="text-white">
              Weekly Schedule
            </Label>
            <p className="text-sm text-neutral-400">Select days and set times for each broadcast</p>
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
                      <Label htmlFor={`time-${day}`} className="w-8 text-white">
                        {day}
                      </Label>
                      <Select
                        value={settings.schedule[day].time.split(' ')[0]}
                        onValueChange={(value) => handleTimeChange(day, value)}
                      >
                        <SelectTrigger
                          id={`time-${day}`}
                          className="w-[180px] bg-[#1E1E1E] border-neutral-600 text-white"
                        >
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2A2A2A] border-neutral-700">
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time} className="text-white focus:bg-neutral-600">
                              {convertFromET(time, userTimeZone)}
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
            <Label htmlFor="batchSize" className="text-white">
              Batch Size
            </Label>
            <p className="text-sm text-neutral-400">Number of recipients per batch</p>
            <Input
              id="batchSize"
              type="number"
              value={settings.batchSize}
              onChange={(e) => handleBatchSizeChange(e.target.value)}
              className={cn('bg-[#1E1E1E] border-neutral-600 text-white', batchSizeError && 'border-red-500')}
            />
            {batchSizeError && <p className="text-sm text-red-400">{batchSizeError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-neutral-800 text-white hover:bg-neutral-700"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!!batchSizeError || isSaving}
            className="bg-[#2F80ED] hover:bg-[#2D7BE5] text-white"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;