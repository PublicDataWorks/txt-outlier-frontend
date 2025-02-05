import { History } from 'lucide-react';

import BroadcastCard from '@/components/BroadcastCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useBroadcastsQuery } from '@/hooks/useBroadcastsQuery';
import BatchItem from './BatchItem';

const PastBroadcastsSection = () => {
  const broadcastsQuery = useBroadcastsQuery();

  if (broadcastsQuery.isLoading) {
    return (
      <BroadcastCard title="Past broadcasts" icon={History}>
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

  if (broadcastsQuery.isError) {
    return null;
  }

  return (
    <BroadcastCard title="Past broadcasts" icon={History}>
      <p className="text-sm text-muted-foreground dark:text-neutral-300 mb-4">
        142 total broadcasts
      </p>
      <div className="space-y-4">
        {broadcastsQuery.data?.past.map(broadcast => <BatchItem key={broadcast.id} broadcast={broadcast}  />)}
      </div>
    </BroadcastCard>
  );
};

export default PastBroadcastsSection;
