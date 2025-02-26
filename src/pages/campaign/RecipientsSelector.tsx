import { useState } from 'react';
import { SegmentGroup, SegmentSelector } from './SegmentSelector';

const RecipientsSelector = () => {
  const [segmentGroups, setSegmentGroups] = useState<SegmentGroup[]>([])

  return (
    <div className="my-4">
      <h3 className="font-semibold">Recipients</h3>
      <SegmentSelector
        includeGroups={segmentGroups}
        onChange={(e) => setSegmentGroups(e)}
        estimatedRecipients={250}
      />
    </div>
  );
};

export default RecipientsSelector;
