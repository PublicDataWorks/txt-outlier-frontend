import { format, addMinutes, isBefore } from 'date-fns';
import { Clock } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';

interface ScheduleDialogProps {
  onSchedule: (date: Date) => void;
  disabled?: boolean;
}

export function ScheduleDialog({
  onSchedule,
  disabled = false,
}: ScheduleDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = () => {
    const now = new Date();
    const selectedDate = new Date(date);
    const hourNum = Number.parseInt(hour);
    const minuteNum = Number.parseInt(minute);

    selectedDate.setHours(
      period === 'PM'
        ? hourNum === 12
          ? 12
          : hourNum + 12
        : hourNum === 12
          ? 0
          : hourNum,
      minuteNum,
    );

    if (isBefore(selectedDate, addMinutes(now, 30))) {
      setError('Please select a time at least 30 minutes from now');
      return;
    }

    onSchedule(selectedDate);
    setOpen(false);
    toast({
      title: 'Broadcast Scheduled',
      description: `Your broadcast has been scheduled for ${format(selectedDate, 'PPpp')}`,
    });
  };

  const resetForm = () => {
    setDate('');
    setHour('');
    setMinute('');
    setPeriod('AM');
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Clock className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Broadcast</DialogTitle>
          <DialogDescription>
            Choose when you&apos;d like this broadcast to be sent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="hour">Hour</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger id="hour">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minute">Minute</Label>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger id="minute">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period">AM/PM</Label>
              <Select
                value={period}
                onValueChange={(value: 'AM' | 'PM') => setPeriod(value)}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!date || !hour || !minute}>
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
