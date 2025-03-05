import { useState, useRef } from 'react';

import { MessageInput } from './MessageInput';
import RecipientsSelector, { RecipientsRef } from './RecipientsSelector';
import { ScheduleDialog } from './ScheduleDialog';
import { SendNowDialog } from './SendNowDialog';

import { Segment } from '@/apis/campaigns';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCreateCampaign } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';

const NewCampaign = () => {
  const { toast } = useToast();
  const createCampaignMutation = useCreateCampaign();
  const recipientsSelectorRef = useRef<RecipientsRef>(null);
  const { data: segmentsData = [] } = useSegments();

  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [segments, setSegments] = useState<{
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  }>({ included: [] });
  const [delay, setDelay] = useState<number | undefined>(undefined);
  const [estimatedRecipients, setEstimatedRecipients] = useState<
    number | undefined
  >(undefined);

  // Create a map of segment IDs to segment names for quick lookup
  const segmentMap = new Map<string, string>();
  segmentsData.forEach((segment) => {
    segmentMap.set(segment.id, segment.name);
  });

  const isFormValid = message.trim().length > 0 && segments.included.length > 0;

  // Function to format segment description by listing all segment names
  const formatSegmentDescription = () => {
    if (segments.included.length === 0) {
      return 'No segments selected';
    }

    // Extract segment IDs safely handling all possible data shapes
    const segmentIds: string[] = [];

    // Process the included segments based on their structure
    const processSegment = (segment: Segment) => {
      if (segment && typeof segment === 'object' && 'id' in segment) {
        segmentIds.push(segment.id);
      }
    };

    segments.included.forEach((item) => {
      if (Array.isArray(item)) {
        // It's an array of segments
        item.forEach(processSegment);
      } else {
        // It's a single segment
        processSegment(item);
      }
    });

    // Map IDs to names
    const segmentNames = segmentIds.map((id) => segmentMap.get(id) || id);

    return segmentNames.join(', ');
  };

  const handleSegmentsChange = (
    newSegments: {
      included: Array<Segment | Segment[]>;
      excluded?: Array<Segment | Segment[]> | null;
    },
    recipientCount?: number,
  ) => {
    setSegments(newSegments);
    if (recipientCount !== undefined) {
      setEstimatedRecipients(recipientCount);
    }
  };

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
    setEstimatedRecipients(undefined);

    // Call the reset method on the RecipientsSelector component
    if (recipientsSelectorRef.current) {
      recipientsSelectorRef.current.reset();
    }
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

        <RecipientsSelector
          ref={recipientsSelectorRef}
          onSegmentsChange={handleSegmentsChange}
        />
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
        messagePreview={message}
        followUpMessagePreview={followUpMessage || undefined} // Only pass if not empty
        segmentDescription={formatSegmentDescription()}
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
