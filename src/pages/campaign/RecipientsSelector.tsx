import { useState } from 'react';

import { SegmentGroup, SegmentSelector } from './SegmentSelector';

const RecipientsSelector = () => {
  const [includeSegmentGroups, setIncludeSegmentGroups] = useState<
    SegmentGroup[]
  >([]);
  const [excludeSegmentGroups, setExcludeSegmentGroups] = useState<
    SegmentGroup[]
  >([]);

  // Calculate estimated recipients
  const estimatedRecipients = 250;

  return (
    <div className="my-4 space-y-6">
      <div>
        <h3 className="font-semibold">Recipients</h3>
        <SegmentSelector
          includeGroups={includeSegmentGroups}
          onChange={(groups) => setIncludeSegmentGroups(groups)}
          estimatedRecipients={estimatedRecipients}
          addButtonLabel="Add a segment"
          addAnotherButtonLabel="Add another segment"
        />
      </div>

      <div>
        <h3 className="font-semibold">Exclusions</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Recipients matching these segments will be excluded from the campaign
        </p>
        <SegmentSelector
          includeGroups={excludeSegmentGroups}
          onChange={(groups) => setExcludeSegmentGroups(groups)}
          estimatedRecipients={0}
          addButtonLabel="Add an exclusion"
          addAnotherButtonLabel="Add another exclusion"
          allowEmptyGroups={true} // Allow removing all exclusion groups
        />
      </div>
    </div>
  );
};

export default RecipientsSelector;
