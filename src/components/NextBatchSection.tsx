import { CalendarClockIcon, Users } from 'lucide-react';

import BroadcastCard from '@/components/BroadcastCard';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/date';

const NextBatchSection = () => {
  return (
    <BroadcastCard title="Next batch" icon={CalendarClockIcon}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground dark:text-neutral-300">
            Scheduled for{' '}
            {formatDateTime(
              new Date(),
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            )}
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-[#1E1E1E] border border-neutral-700 cursor-pointer hover:bg-[#2C2C2C]">
            <Users className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-300">5000 recipients</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 gap-2 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              Pause schedule
            </Button>
            <Button className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] dark:text-white">
              Send now
            </Button>
          </div>
        </div>
      </div>
    </BroadcastCard>
  );
};

export default NextBatchSection;
