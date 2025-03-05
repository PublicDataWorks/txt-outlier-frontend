import { useState } from 'react';

import { MessageInput } from './MessageInput';
import RecipientsSelector from './RecipientsSelector';
import { ScheduleDialog } from './ScheduleDialog';
import { SendNowDialog } from './SendNowDialog';

import { Segment } from '@/apis/campaigns';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCreateCampaign } from '@/hooks/useCampaign';

const NewCampaign = () => {
  const { toast } = useToast();
  const createCampaignMutation = useCreateCampaign();

  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [segments, setSegments] = useState<{
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  }>({ included: [] });
  const [delay, setDelay] = useState<number | undefined>(undefined);

  // Calculate estimated recipients based on segments
  const estimatedRecipients = 250; // This would be calculated based on segments

  const isFormValid = message.trim().length > 0 && segments.included.length > 0;

  const handleSendNow = () => {
    if (!isFormValid) return;

    const twoMinutesFromNow = Math.floor((Date.now() + 2 * 60 * 1000) / 1000);

    const payload = {
      title: campaignName || undefined, // Don't send empty strings, use undefined
      firstMessage: message,
      secondMessage: followUpMessage || undefined, // Don't send empty strings
      segments,
      delay: delay,
      runAt: twoMinutesFromNow, // Send now
    };

    createCampaignMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Campaign Sent',
          description: 'Your campaign has been sent successfully.',
        });
        resetForm();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to send campaign: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  const handleSchedule = (date: Date) => {
    if (!isFormValid) return;

    const payload = {
      title: campaignName || undefined,
      firstMessage: message,
      secondMessage: followUpMessage || undefined,
      segments,
      delay: delay,
      runAt: Math.floor(date.getTime() / 1000),
    };

    createCampaignMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Campaign Scheduled',
          description: `Your campaign has been scheduled for ${date.toLocaleString()}.`,
        });
        resetForm();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: `Failed to schedule campaign: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  const resetForm = () => {
    setCampaignName('');
    setMessage('');
    setFollowUpMessage('');
    setSegments({ included: [] });
    setDelay(undefined);
  };

  // Format segments for display in the SendNowDialog
  const formatSegmentsDescription = () => {
    return `${segments.included.length} segments selected`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Campaign Title (optional)"
          value={campaignName}
          className="text-sm"
          onChange={(e) => setCampaignName(e.target.value)}
        />

        <MessageInput
          value={message}
          followUpValue={followUpMessage}
          onChange={setMessage}
          onFollowUpChange={setFollowUpMessage}
          onDelayChange={setDelay}
        />

        <RecipientsSelector onSegmentsChange={setSegments} />
      </div>

      <Separator className="my-6" />

      <div className="flex gap-2">
        <ScheduleDialog
          onSchedule={handleSchedule}
          disabled={!isFormValid || createCampaignMutation.isPending}
        />
        <SendNowDialog
          onSend={handleSendNow}
          recipientCount={estimatedRecipients}
          segmentDescription={formatSegmentsDescription()}
          messagePreview={message}
          disabled={!isFormValid || createCampaignMutation.isPending}
        />

        {createCampaignMutation.isPending && (
          <p className="text-sm text-muted-foreground ml-2 self-center">
            Creating campaign...
          </p>
        )}
      </div>
    </div>
  );
};

export default NewCampaign;
