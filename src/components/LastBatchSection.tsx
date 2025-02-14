import { CheckCircle2 } from 'lucide-react';

import BroadcastCard from '@/components/BroadcastCard';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useBroadcastsQuery } from '@/hooks/useBroadcastsQuery';
import { formatDateTime } from '@/lib/date';

const LastBatchSection = () => {
  const broadcastsQuery = useBroadcastsQuery();

  if (broadcastsQuery.isLoading) {
    return (
      <BroadcastCard title="Last batch" icon={CheckCircle2}>
        <div data-testid="skeleton" className="flex flex-col space-y-3 w-full">
          <Skeleton className="h-4 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <Skeleton className="h-[125px] w-full rounded-xl" />
          </div>
        </div>
      </BroadcastCard>
    );
  }

  if (broadcastsQuery.isError) {
    return null;
  }

  const lastBatch = broadcastsQuery.data?.past[0];

  if (!lastBatch) {
    return (
      <BroadcastCard title="Last batch" icon={CheckCircle2}>
      <div>Empty</div>
    </BroadcastCard>
    );
  }

  return (
    <BroadcastCard title="Last batch" icon={CheckCircle2}>
      <div className="text-sm text-muted-foreground dark:text-neutral-300 mb-4">
        Sent on{' '}
        {formatDateTime(
          new Date(lastBatch!.runAt * 1000),
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        )}
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Conversation starters sent</span>
            <span className="font-medium tabular-nums">
              {lastBatch?.totalFirstSent.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Follow-up messages sent</span>
            <span className="font-medium tabular-nums">
              {lastBatch?.totalSecondSent.toLocaleString()}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Delivered successfully</span>
            <span className="font-medium tabular-nums text-green-600 dark:text-green-400">
              {lastBatch?.successfullyDelivered.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Failed to deliver</span>
            <span className="font-medium tabular-nums text-red-600 dark:text-red-400">
              {lastBatch?.failedDelivered.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Unsubscribes</span>
            <span className="font-medium tabular-nums text-red-600 dark:text-red-400">
              {lastBatch?.totalUnsubscribed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </BroadcastCard>
  );
};

export default LastBatchSection;
