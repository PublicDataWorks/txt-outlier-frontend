import { CalendarClockIcon, Users } from 'lucide-react';

import BroadcastCard from '@/components/BroadcastCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBroadcastsQuery } from '@/hooks/useBroadcastsQuery';
import { formatDateTime } from '@/lib/date';

const NextBatchSection = () => {
  const broadcastsQuery = useBroadcastsQuery();

  if (broadcastsQuery.isLoading) {
    return (
      <BroadcastCard title="Next batch" icon={CalendarClockIcon}>
        <div className="flex flex-col space-y-3 w-full">
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        </div>
      </BroadcastCard>
    );
  }

  return (
    <BroadcastCard title="Next batch" icon={CalendarClockIcon}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground dark:text-neutral-300">
            Scheduled for{' '}
            {formatDateTime(
              new Date(broadcastsQuery.data!.upcoming.runAt * 1000),
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            )}
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-[#1E1E1E] border border-neutral-700 cursor-pointer hover:bg-[#2C2C2C]">
            <Users className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-300">
              {broadcastsQuery.data?.upcoming.noRecipients} recipients
            </span>
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
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-neutral-300">
              Conversation starter message
            </label>
            <div className="w-full whitespace-pre-wrap rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors dark:bg-[#1E1E1E] dark:border-neutral-600 dark:hover:bg-neutral-800">
              {broadcastsQuery.data?.upcoming.firstMessage}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-neutral-300">
              Follow-up message
            </label>
            <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer whitespace-pre-wrap hover:bg-accent/50 transition-colors dark:bg-[#1E1E1E] dark:border-neutral-600 dark:hover:bg-neutral-800">
              {broadcastsQuery.data?.upcoming.secondMessage}
            </div>
          </div>
        </div>
      </div>
    </BroadcastCard>
  );
};

export default NextBatchSection;
