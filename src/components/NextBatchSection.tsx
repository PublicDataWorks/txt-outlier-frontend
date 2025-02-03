import { CalendarClockIcon, Users } from 'lucide-react';

import { UpcomingBroadcast } from '@/apis/broadcasts';
import BroadcastCard from '@/components/BroadcastCard';
import EditConversationMessageDialog from '@/components/EditConversationMessageDialog';
import PauseScheduleDialog from '@/components/PauseScheduleDialog';
import { SendNowDialog } from '@/components/SendNowDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBroadcastMutation,
  useBroadcastsQuery,
} from '@/hooks/useBroadcastsQuery';
import { formatDateTime } from '@/lib/date';

const NextBatchSection = () => {
  const broadcastsQuery = useBroadcastsQuery();
  const broadcastMutation = useBroadcastMutation();

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

  if (broadcastsQuery.isError) {
    return null;
  }

  const updateBroadcast = async (
    data: Partial<UpcomingBroadcast>,
  ): Promise<void> => {
    await broadcastMutation.mutateAsync(data);
  };

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
            <PauseScheduleDialog
              onConfirm={() => {}}
              currentDate={
                new Date(broadcastsQuery.data!.upcoming.runAt * 1000)
              }
            />
            <SendNowDialog onConfirm={() => {}} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-neutral-300">
              Conversation starter message
            </label>
            <EditConversationMessageDialog
              message={broadcastsQuery.data!.upcoming.firstMessage}
              title="Edit conversation starter"
              onSave={(newMessage) =>
                updateBroadcast({
                  id: broadcastsQuery.data?.upcoming.id,
                  firstMessage: newMessage,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-neutral-300">
              Follow-up message
            </label>
            <EditConversationMessageDialog
              message={broadcastsQuery.data!.upcoming.secondMessage}
              title="Edit Follow-up message"
              onSave={(newMessage) =>
                updateBroadcast({
                  id: broadcastsQuery.data?.upcoming.id,
                  secondMessage: newMessage,
                })
              }
            />
          </div>
        </div>
      </div>
    </BroadcastCard>
  );
};

export default NextBatchSection;
