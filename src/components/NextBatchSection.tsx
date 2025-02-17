import { CalendarClockIcon } from 'lucide-react';

import { sendNowBroadcast, UpcomingBroadcast } from '@/apis/broadcasts';
import BroadcastCard from '@/components/BroadcastCard';
import EditConversationMessageDialog from '@/components/EditConversationMessageDialog';
import EditNumberOfRecipientsDialog from '@/components/EditNumberOfRecipientsDialog.tsx';
import PauseScheduleDialog from '@/components/PauseScheduleDialog';
import { SendNowDialog } from '@/components/SendNowDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBroadcastMutation,
  useBroadcastsQuery
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
    data: Partial<UpcomingBroadcast>
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
              Intl.DateTimeFormat().resolvedOptions().timeZone
            )}
          </div>
          <EditNumberOfRecipientsDialog
            noRecipients={broadcastsQuery.data!.upcoming.noRecipients || 0}
            title="Edit Recipient Count"
            onSave={(newNoRecipients) =>
              updateBroadcast({
                id: broadcastsQuery.data?.upcoming.id,
                noRecipients: newNoRecipients
              })
            }
          />
          <div className="flex gap-2">
            <PauseScheduleDialog
              onConfirm={(runAt) =>
                updateBroadcast({
                  id: broadcastsQuery.data?.upcoming.id,
                  runAt
                })
              }
              currentDate={
                new Date(broadcastsQuery.data!.upcoming.runAt * 1000)
              }
            />
            <SendNowDialog sendNow={sendNowBroadcast} />
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
                  firstMessage: newMessage
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
                  secondMessage: newMessage
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
