import { useState } from 'react';

import { MessageInput } from './MessageInput';
import RecipientsSelector from './RecipientsSelector';

import { Input } from '@/components/ui/input';

const NewCampaign = () => {
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');

  return (
    <>
      <div className="spave-y-4">
        <Input
          placeholder="Campaign Title (optional)"
          value={campaignName}
          className="text-sm mb-4"
          onChange={(e) => setCampaignName(e.target.value)}
        />
        <MessageInput
          value={message}
          followUpValue={followUpMessage}
          onChange={setMessage}
          onFollowUpChange={setFollowUpMessage}
        />

        <RecipientsSelector />
      </div>
    </>
  );
};

export default NewCampaign;
