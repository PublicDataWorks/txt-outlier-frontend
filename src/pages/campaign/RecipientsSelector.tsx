import { forwardRef, useImperativeHandle, useState } from 'react';

import { SegmentGroup, SegmentSelector } from './SegmentSelector';

import { Segment } from '@/apis/campaigns';

interface RecipientsSelectorProps {
  onSegmentsChange: (segments: {
    included: Array<Segment | Segment[]>;
    excluded?: Array<Segment | Segment[]> | null;
  }) => void;
}

export interface RecipientsRef {
  reset: () => void;
}

const RecipientsSelector = forwardRef<RecipientsRef, RecipientsSelectorProps>(
  ({ onSegmentsChange }, ref) => {
    const [includeSegmentGroups, setIncludeSegmentGroups] = useState<
      SegmentGroup[]
    >([]);
    const [excludeSegmentGroups, setExcludeSegmentGroups] = useState<
      SegmentGroup[]
    >([]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setIncludeSegmentGroups([]);
        setExcludeSegmentGroups([]);
      },
    }));

    // Calculate estimated recipients
    const estimatedRecipients = 250;

    // Convert segment groups to API format whenever they change
    const handleSegmentsChange = (
      includeGroups: SegmentGroup[],
      excludeGroups: SegmentGroup[],
    ) => {
      // Process include groups with their nested structure
      const included = includeGroups.map((group) => {
        // Convert the base segment to a Segment object
        const baseSegment = {
          id: group.base.segment,
          since: group.base.timeframe
            ? Math.floor(group.base.timeframe.getTime() / 1000)
            : 0,
        };

        // If there are filters, create a nested array with the base segment and filters
        if (group.filters.length > 0) {
          const filterSegments = group.filters.map((filter) => ({
            id: filter.segment,
            since: filter.timeframe
              ? Math.floor(filter.timeframe.getTime() / 1000)
              : 0,
          }));

          // Return an array with the base segment and all filter segments
          return [baseSegment, ...filterSegments] as Segment[];
        }

        // If no filters, just return the base segment
        return baseSegment;
      });

      // Process exclude groups, similar to include groups
      const excluded =
        excludeGroups.length > 0
          ? excludeGroups.map((group) => {
              const baseSegment = {
                id: group.base.segment,
                since: group.base.timeframe
                  ? Math.floor(group.base.timeframe.getTime() / 1000)
                  : 0,
              };

              if (group.filters.length > 0) {
                const filterSegments = group.filters.map((filter) => ({
                  id: filter.segment,
                  since: filter.timeframe
                    ? Math.floor(filter.timeframe.getTime() / 1000)
                    : 0,
                }));

                return [baseSegment, ...filterSegments] as Segment[];
              }

              return baseSegment;
            })
          : [];

      onSegmentsChange({
        included,
        excluded,
      });
    };

    const handleIncludeGroupsChange = (groups: SegmentGroup[]) => {
      setIncludeSegmentGroups(groups);
      handleSegmentsChange(groups, excludeSegmentGroups);
    };

    const handleExcludeGroupsChange = (groups: SegmentGroup[]) => {
      setExcludeSegmentGroups(groups);
      handleSegmentsChange(includeSegmentGroups, groups);
    };

    return (
      <div className="my-4 space-y-6">
        <div>
          <h3 className="font-semibold">Recipients</h3>
          <SegmentSelector
            includeGroups={includeSegmentGroups}
            onChange={handleIncludeGroupsChange}
            estimatedRecipients={estimatedRecipients}
            addButtonLabel="Add a segment"
            addAnotherButtonLabel="Add another segment"
          />
        </div>

        <div>
          <h3 className="font-semibold">Exclusions</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Recipients matching these segments will be excluded from the
            campaign
          </p>
          <SegmentSelector
            includeGroups={excludeSegmentGroups}
            onChange={handleExcludeGroupsChange}
            estimatedRecipients={0}
            addButtonLabel="Add an exclusion"
            addAnotherButtonLabel="Add another exclusion"
            allowEmptyGroups={true} // Allow removing all exclusion groups
          />
        </div>
      </div>
    );
  },
);

RecipientsSelector.displayName = 'RecipientsSelector';

export default RecipientsSelector;
