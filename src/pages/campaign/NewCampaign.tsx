import { useState, useRef, useEffect } from 'react';
import { Tag, AlertCircle, CheckCircle } from 'lucide-react';

import { MessageInput } from './MessageInput';
import RecipientsSelector, { RecipientsRef } from './RecipientsSelector';
import { ScheduleDialog } from './ScheduleDialog';
import { SendNowDialog } from './SendNowDialog';

import { Segment, CreateCampaignFormData } from '@/apis/campaigns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateCampaign,
  useCreateCampaignWithFile,
} from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';

const NewCampaign = () => {
  const { toast } = useToast();
  const createCampaignMutation = useCreateCampaign();
  const createCampaignWithFileMutation = useCreateCampaignWithFile();
  const recipientsSelectorRef = useRef<RecipientsRef>(null);
  const { data: segmentsData = [] } = useSegments();

  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [segments, setSegments] = useState<{
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  }>({ included: [] });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [delay, setDelay] = useState<number | undefined>(undefined);
  const [estimatedRecipients, setEstimatedRecipients] = useState<
    number | undefined
  >(undefined);
  const [campaignLabelName, setCampaignLabelName] = useState<string | undefined>(undefined);

  // Create a map of segment IDs to segment names for quick lookup
  const segmentMap = new Map<string, string>();
  segmentsData.forEach((segment) => {
    segmentMap.set(segment.id, segment.name);
  });

  const isFormValid =
    message.trim().length > 0 &&
    ((segments.included.length > 0 && !csvFile) || csvFile !== null);

  const isPending =
    createCampaignMutation.isPending ||
    createCampaignWithFileMutation.isPending;

  // Function to format segment description by listing all segment names
  const formatSegmentDescription = () => {
    if (csvFile) {
      return `CSV File: ${csvFile.name}`;
    }

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
    file?: File | null,
  ) => {
    setSegments(newSegments);
    setCsvFile(file || null);

    if (recipientCount !== undefined) {
      setEstimatedRecipients(recipientCount);
    }
  };

  const submitCampaign = async (runAt: number) => {
    if (!isFormValid) return;

    if (csvFile) {
      // Handle CSV file upload with multipart/form-data
      const formData = new FormData() as CreateCampaignFormData;
      formData.append('file', csvFile);

      // Add other campaign data
      formData.append('title', campaignName || '');
      formData.append('firstMessage', message);
      if (followUpMessage) formData.append('secondMessage', followUpMessage);
      if (delay !== undefined) formData.append('delay', delay.toString());
      if (campaignLabelName) formData.append('campaignLabelName', campaignLabelName);
      formData.append('runAt', runAt.toString());

      return await createCampaignWithFileMutation.mutateAsync(formData);
    } else {
      // Handle segment-based campaign using the existing mutation
      const payload = {
        title: campaignName || undefined,
        firstMessage: message,
        secondMessage: followUpMessage || undefined,
        segments,
        delay,
        runAt,
        campaignLabelName,
      };

      return await createCampaignMutation.mutateAsync(payload);
    }
  };

  const handleSendNow = async () => {
    if (!isFormValid) return;

    const twoMinutesFromNow = Math.floor((Date.now() + 2 * 60 * 1000) / 1000);

    try {
      await submitCampaign(twoMinutesFromNow);

      toast({
        title: 'Campaign Scheduled',
        description: 'Your campaign will be sent after two minutes.',
      });
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: 'Error',
        description: `Failed to send campaign: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const handleSchedule = async (date: Date) => {
    if (!isFormValid) return;

    const scheduledTime = Math.floor(date.getTime() / 1000);

    try {
      await submitCampaign(scheduledTime);

      toast({
        title: 'Campaign Scheduled',
        description: `Your campaign has been scheduled for ${date.toLocaleString()}.`,
      });
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: 'Error',
        description: `Failed to schedule campaign: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setCampaignName('');
    setMessage('');
    setFollowUpMessage('');
    setSegments({ included: [] });
    setCsvFile(null);
    setDelay(undefined);
    setEstimatedRecipients(undefined);
    setCampaignLabelName(undefined);

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

        <div>
          <Input
            id="campaign-label"
            placeholder="Missive label for campaign conversations (optional)"
            value={campaignLabelName || ''}
            onChange={(e) => setCampaignLabelName(e.target.value || undefined)}
            className="text-sm"
          />
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex gap-2">
        <ScheduleDialog
          onSchedule={handleSchedule}
          disabled={!isFormValid || isPending}
        />
        <SendNowDialog
          onSend={handleSendNow}
          recipientCount={estimatedRecipients}
          messagePreview={message}
          followUpMessagePreview={followUpMessage || undefined}
          segmentDescription={formatSegmentDescription()}
          disabled={!isFormValid || isPending}
        />
        {isPending && (
          <p className="text-sm text-muted-foreground ml-2 self-center">
            Creating campaign...
          </p>
        )}
      </div>
    </div>
  );
};

export default NewCampaign;
