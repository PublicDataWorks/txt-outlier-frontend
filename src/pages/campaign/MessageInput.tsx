import { Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  followUpValue: string;
  onChange: (value: string) => void;
  onFollowUpChange: (value: string) => void;
  onDelayChange?: (delayInSeconds: number | undefined) => void;
}

export function MessageInput({
  value,
  followUpValue,
  onChange,
  onFollowUpChange,
  onDelayChange,
}: MessageInputProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState('10'); // Default to 10 minutes
  const [segments, setSegments] = useState(0);
  const [followUpSegments, setFollowUpSegments] = useState(0);

  // When follow-up is shown, set the default delay and update parent
  useEffect(() => {
    if (showFollowUp) {
      // Convert minutes to seconds for the API
      onDelayChange?.(10 * 60); // Default 10 minutes in seconds
    } else {
      onDelayChange?.(undefined);
    }
  }, [showFollowUp, onDelayChange]);

  const handleMessageChange = (value: string) => {
    onChange(value);
    setSegments(value.length > 0 ? Math.ceil(value.length / 160) : 0);
  };

  const handleFollowUpMessageChange = (value: string) => {
    onFollowUpChange(value);
    setFollowUpSegments(value.length > 0 ? Math.ceil(value.length / 160) : 0);
  };

  const handleDelayChange = (value: string) => {
    setDelayMinutes(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      // Convert minutes to seconds for the API
      onDelayChange?.(numValue * 60);
    } else {
      // If invalid, set to default 10 minutes
      onDelayChange?.(10 * 60);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Enter your message here"
          value={value}
          onChange={(e) => handleMessageChange(e.target.value)}
          className="border border-input min-h-[100px] text-sm"
        />
        <p className="text-sm text-muted-foreground">
          {segments} SMS message{segments !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFollowUp(!showFollowUp)}
        >
          {showFollowUp ? (
            <>
              <Minus className="mr-2 h-4 w-4" />
              Remove Follow-up Message
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Follow-up Message
            </>
          )}
        </Button>

        {showFollowUp && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This message will be sent if the recipient does not reply to the
                first message.
              </p>
              <div className="flex space-x-2 items-center">
                <Label htmlFor="delay">Delay (minutes)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="1"
                  placeholder="10"
                  value={delayMinutes}
                  onChange={(e) => handleDelayChange(e.target.value)}
                  className="w-24"
                />
              </div>
              <Textarea
                placeholder="Enter your follow-up message here"
                value={followUpValue}
                onChange={(e) => handleFollowUpMessageChange(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <p className="text-sm text-muted-foreground">
                {followUpSegments} SMS message
                {followUpSegments !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
