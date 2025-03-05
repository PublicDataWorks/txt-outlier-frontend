import { forwardRef, useImperativeHandle, useState } from 'react';

import { SegmentGroup, SegmentSelector } from './SegmentSelector';

import { Segment, RecipientCountPayload } from '@/apis/campaigns';
import { useRecipientCount } from '@/hooks/useCampaign';

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

    // Use the recipient count mutation
    const {
      mutate: countRecipients,
      data: recipientCountData,
      isPending: isCountingRecipients,
      reset: resetRecipientCount,
    } = useRecipientCount();

    useImperativeHandle(ref, () => ({
      reset: () => {
        setIncludeSegmentGroups([]);
        setExcludeSegmentGroups([]);
        resetRecipientCount();

        onSegmentsChange({ included: [], excluded: [] });
      },
    }));

    // Get the estimated recipients value from the API response
    const estimatedRecipients = recipientCountData?.recipient_count;

    // Convert segment groups to API format whenever they change
    const handleSegmentsChange = (
      includeGroups: SegmentGroup[],
      excludeGroups: SegmentGroup[],
    ) => {
      // Process include groups with their nested structure
      const included = includeGroups
        .filter((group) => group.base.segment !== '') // Filter out groups with empty base segment
        .map((group) => {
          // Convert the base segment to a Segment object
          const baseSegment = {
            id: group.base.segment,
            since: group.base.timeframe
              ? Math.floor(group.base.timeframe.getTime() / 1000)
              : 0,
          };

          // If there are filters, create a nested array with the base segment and filters
          if (group.filters.length > 0) {
            // Only include filters with non-empty segment IDs
            const filterSegments = group.filters
              .filter((filter) => filter.segment !== '')
              .map((filter) => ({
                id: filter.segment,
                since: filter.timeframe
                  ? Math.floor(filter.timeframe.getTime() / 1000)
                  : 0,
              }));

            // Return an array with the base segment and all filter segments
            // Only create a nested array if there are valid filters
            return filterSegments.length > 0
              ? ([baseSegment, ...filterSegments] as Segment[])
              : baseSegment;
          }

          // If no filters, just return the base segment
          return baseSegment;
        });

      // Process exclude groups, similar to include groups
      const excluded =
        excludeGroups.length > 0
          ? excludeGroups
              .filter((group) => group.base.segment !== '') // Filter out groups with empty base segment
              .map((group) => {
                const baseSegment = {
                  id: group.base.segment,
                  since: group.base.timeframe
                    ? Math.floor(group.base.timeframe.getTime() / 1000)
                    : 0,
                };

                if (group.filters.length > 0) {
                  // Only include filters with non-empty segment IDs
                  const filterSegments = group.filters
                    .filter((filter) => filter.segment !== '')
                    .map((filter) => ({
                      id: filter.segment,
                      since: filter.timeframe
                        ? Math.floor(filter.timeframe.getTime() / 1000)
                        : 0,
                    }));

                  // Only create a nested array if there are valid filters
                  return filterSegments.length > 0
                    ? ([baseSegment, ...filterSegments] as Segment[])
                    : baseSegment;
                }

                return baseSegment;
              })
          : [];

      const segments = {
        included,
        excluded,
      };

      // Call the parent callback
      onSegmentsChange(segments);

      // Fetch recipient count if there are included segments
      if (included.length > 0) {
        const payload: RecipientCountPayload = {
          segments: segments,
        };
        countRecipients(payload);
      }
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
          <p className="text-sm font-medium my-4">
            {isCountingRecipients
              ? 'Calculating recipient count...'
              : estimatedRecipients !== undefined
                ? `Estimated recipients: ${estimatedRecipients.toLocaleString()}`
                : 'Select segments to see estimated recipient count'}
          </p>
          <SegmentSelector
            includeGroups={includeSegmentGroups}
            onChange={handleIncludeGroupsChange}
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
