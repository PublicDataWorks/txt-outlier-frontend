import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  followUpValue: string;
  onChange: (value: string) => void;
  onFollowUpChange: (value: string) => void;
}

export function MessageInput({
  value,
  followUpValue,
  onChange,
  onFollowUpChange,
}: MessageInputProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [segments, setSegments] = useState(0);
  const [followUpSegments, setFollowUpSegments] = useState(0);

  const handleMessageChange = (value: string) => {
    onChange(value);
    setSegments(value.length > 0 ? Math.ceil(value.length / 160) : 0);
  };

  const handleFollowUpMessageChange = (value: string) => {
    onFollowUpChange(value);
    setFollowUpSegments(value.length > 0 ? Math.ceil(value.length / 160) : 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Enter your message here"
          value={value}
          onChange={(e) => handleMessageChange(e.target.value)}
          className="border border-input min-h-[100px] text-sm"
          style={{ border: '1px solid #e5e5e5' }}
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
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This message will be sent if the recipient does not reply to the
              first message.
            </p>
            <Textarea
              placeholder="Enter your follow-up message here"
              value={followUpValue}
              onChange={(e) => handleFollowUpMessageChange(e.target.value)}
              className="min-h-[100px] text-sm"
              style={{ border: '1px solid #e5e5e5' }}
            />
            <p className="text-sm text-muted-foreground">
              {followUpSegments} SMS message{followUpSegments !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
