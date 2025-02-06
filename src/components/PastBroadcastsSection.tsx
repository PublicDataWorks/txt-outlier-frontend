import { History } from 'lucide-react';
import { Fragment } from 'react';

import BatchItem from '@/components/BatchItem';
import BroadcastCard from '@/components/BroadcastCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePastBroadcastsQuery } from '@/hooks/useBroadcastsQuery';

const PastBroadcastsSection = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePastBroadcastsQuery();

  if (isLoading) {
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

  if (isError) {
    return null;
  }

  return (
    <BroadcastCard title="Past broadcasts" icon={History}>
      {/* <p className="text-sm text-muted-foreground dark:text-neutral-300 mb-4">
        142 total broadcasts
      </p> */}
      <div className="space-y-4">
        {data?.pages.map((page, pageIndex) => (
          <Fragment key={pageIndex}>
            {page.past.map((broadcast) => (
              <BatchItem key={broadcast.id} broadcast={broadcast} />
            ))}
          </Fragment>
        ))}
      </div>
      {hasNextPage && (
        <div className="mt-4">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="link"
            className="w-full dark:text-neutral-300 hover:dark:text-neutral-100"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Show more'}
          </Button>
        </div>
      )}
    </BroadcastCard>
  );
};

export default PastBroadcastsSection;
