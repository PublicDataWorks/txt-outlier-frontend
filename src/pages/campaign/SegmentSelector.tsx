import { PlusCircle, Filter, X } from 'lucide-react';

import SegmentDropdown from './SegmentDropdown';

import { Button } from '@/components/ui/button';

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
}

const segments = [
  'HOUSING',
  'DTE',
  'REPAY',
  'LANDLORD',
  'FORECLOSURE',
  'FLOODING',
  'CRISIS',
  'PROPERTY TAXES',
  'HOMEOWNERS',
  'TAX DEBT',
  'BULK TRASH',
  'TAXES',
  'REPORTER',
  'Welcome Message',
  'Tax Foreclosure Reminder',
  'Rental Assistance Update',
  'February Tax Reminder',
  'HOPE Campaign',
  'Texted-In',
  'Property Lookup',
];

export function SegmentSelector({
  includeGroups,
  onChange,
  estimatedRecipients,
}: SegmentSelectorProps) {
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

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">
        Estimated recipients: {estimatedRecipients.toLocaleString()}
      </p>
      {includeGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`space-y-2 border p-4 rounded-md relative ${groupIndex > 0 ? 'pt-10' : ''}`}
        >
          {groupIndex > 0 && (
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
            segments={segments}
          />

          {group.filters.map((filter, filterIndex) => (
            <div key={filterIndex} className="flex items-start space-x-2 ml-4">
              <div className="flex-1">
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
                  segments={segments}
                />
              </div>
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
        {includeGroups.length === 0 ? 'Add Segment' : 'Add Another Segment'}
      </Button>
    </div>
  );
}
