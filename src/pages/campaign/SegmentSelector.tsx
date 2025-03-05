import { PlusCircle, Filter, X } from 'lucide-react';

import SegmentDropdown from './SegmentDropdown';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSegments } from '@/hooks/useSegments';

export interface SegmentGroup {
  base: {
    segment: string;
    timeframe: Date | undefined;
  };
  filters: Array<{
    segment: string;
    timeframe: Date | undefined;
  }>;
}

interface SegmentSelectorProps {
  includeGroups: SegmentGroup[];
  onChange: (includeGroups: SegmentGroup[]) => void;
  estimatedRecipients: number;
  addButtonLabel?: string;
  addAnotherButtonLabel?: string;
  allowEmptyGroups?: boolean;
}

export function SegmentSelector({
  includeGroups,
  onChange,
  estimatedRecipients,
  addButtonLabel = 'Add Segment',
  addAnotherButtonLabel = 'Add Another Segment',
  allowEmptyGroups = false,
}: SegmentSelectorProps) {
  const { data: backendSegments, isLoading } = useSegments();

  const addSegmentGroup = () => {
    onChange([
      ...includeGroups,
      { base: { segment: '', timeframe: undefined }, filters: [] },
    ]);
  };

  const updateSegmentGroup = (index: number, updatedGroup: SegmentGroup) => {
    const newGroups = [...includeGroups];
    newGroups[index] = updatedGroup;
    onChange(newGroups);
  };

  const removeSegmentGroup = (index: number) => {
    const newGroups = includeGroups.filter((_, i) => i !== index);
    onChange(newGroups);
  };

  const addFilter = (groupIndex: number) => {
    const newGroups = [...includeGroups];
    newGroups[groupIndex].filters.push({ segment: '', timeframe: undefined });
    onChange(newGroups);
  };

  const removeFilter = (groupIndex: number, filterIndex: number) => {
    const newGroups = [...includeGroups];
    newGroups[groupIndex].filters = newGroups[groupIndex].filters.filter(
      (_, i) => i !== filterIndex,
    );
    onChange(newGroups);
  };

  const segmentOptions =
    backendSegments?.map((segment) => ({
      id: segment.id,
      name: segment.name,
    })) || [];

  return (
    <div className="space-y-4">
      {estimatedRecipients > 0 && (
        <p className="text-sm font-medium">
          Estimated recipients: {estimatedRecipients.toLocaleString()}
        </p>
      )}

      {isLoading ? (
        <div className="w-[150px] h-[40px] rounded-md border flex px-4 justify-center items-center">
          <Skeleton className="h-3 w-full" />
        </div>
      ) : (
        <>
          {includeGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`space-y-2 border p-4 rounded-md relative ${groupIndex > 0 || allowEmptyGroups ? 'pt-10' : ''}`}
            >
              {(groupIndex > 0 || allowEmptyGroups) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => removeSegmentGroup(groupIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <SegmentDropdown
                segment={group.base.segment}
                timeframe={group.base.timeframe}
                onChange={(segment, timeframe) =>
                  updateSegmentGroup(groupIndex, {
                    ...group,
                    base: { segment, timeframe },
                  })
                }
                segments={segmentOptions}
              />

              {group.filters.map((filter, filterIndex) => (
                <div
                  key={filterIndex}
                  className="grid grid-cols-[minmax(0,1fr),36px] gap-2 items-start ml-4"
                >
                  <SegmentDropdown
                    segment={filter.segment}
                    timeframe={filter.timeframe}
                    onChange={(segment, timeframe) => {
                      const newFilters = [...group.filters];
                      newFilters[filterIndex] = { segment, timeframe };
                      updateSegmentGroup(groupIndex, {
                        ...group,
                        filters: newFilters,
                      });
                    }}
                    segments={segmentOptions}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(groupIndex, filterIndex)}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addFilter(groupIndex)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Add Filter
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSegmentGroup}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {includeGroups.length === 0
              ? addButtonLabel
              : addAnotherButtonLabel}
          </Button>
        </>
      )}
    </div>
  );
}
