import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Campaign, Segment as CampaignSegment } from '@/apis/campaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePastCampaigns } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { unixTimestampInSecondToDate } from '@/lib/date';

const CampaignHistory = () => {
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(
    null,
  );

  const {
    campaigns,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    loadMore,
    pagination,
  } = usePastCampaigns(10);

  // Use the existing useSegments hook
  const { data: segmentsData = [] } = useSegments();

  // Create a map of segment IDs to segment names for quick lookup
  const segmentMap = new Map<string, string>();
  segmentsData.forEach((segment) => {
    segmentMap.set(segment.id, segment.name);
  });

  const toggleExpand = (campaignId: number) => {
    setExpandedCampaignId(
      expandedCampaignId === campaignId ? null : campaignId,
    );
  };

  // Properly typed function to extract segment names
  const getSegmentNames = (segments: Campaign['segments']) => {
    if (!segments || !segments.included) return '';

    // Extract segment IDs safely handling all possible data shapes
    const segmentIds: string[] = [];

    // Handle all possible shapes of segments.included
    const processSegment = (segment: CampaignSegment) => {
      if (segment && typeof segment === 'object' && 'id' in segment) {
        segmentIds.push(segment.id);
      }
    };

    // Process the included segments based on their structure
    if (Array.isArray(segments.included)) {
      segments.included.forEach((item) => {
        if (Array.isArray(item)) {
          // It's an array of segments
          item.forEach(processSegment);
        } else {
          // It's a single segment
          processSegment(item);
        }
      });
    } else if (segments.included && typeof segments.included === 'object') {
      // It's a single segment object (not in an array)
      processSegment(segments.included as CampaignSegment);
    }

    // Map IDs to names
    const segmentNames = segmentIds.map((id) => segmentMap.get(id) || id);

    return segmentNames.join(', ');
  };

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold mb-4">Past Campaigns</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold mb-4">Past Campaigns</h3>
        <Card className="bg-red-50">
          <CardContent className="p-4 text-red-500">
            Error loading campaigns: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">
        Past Campaigns {pagination && `(${pagination.totalItems})`}
      </h3>
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No past campaigns found
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="overflow-hidden cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <CardContent className="p-4">
                  <div
                    className="grid grid-cols-[1fr_auto] gap-4"
                    onClick={() => toggleExpand(campaign.id)}
                  >
                    {/* Left side with campaign details - will truncate as needed */}
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                        {campaign.title || 'Untitled Campaign'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {unixTimestampInSecondToDate(campaign.runAt)}
                      </p>
                      <p className="text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                        {getSegmentNames(campaign.segments)}
                      </p>
                    </div>

                    {/* Right side with stats and chevron - fixed width */}
                    <div className="flex items-start space-x-2 whitespace-nowrap">
                      <p className="text-sm text-muted-foreground">
                        ~{campaign.recipientCount.toLocaleString()}{' '}
                        <Users className="inline h-4 w-4" />
                      </p>
                      {expandedCampaignId === campaign.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {expandedCampaignId === campaign.id && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-muted p-3 rounded-md">
                        <h4 className="font-medium mb-2">Message:</h4>
                        <p className="break-words">{campaign.firstMessage}</p>
                      </div>
                      {campaign.secondMessage && (
                        <div className="bg-muted p-3 rounded-md">
                          <h4 className="font-medium mb-2">
                            Follow-up Message:
                          </h4>
                          <p className="break-words">
                            {campaign.secondMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {hasNextPage && (
            <Button
              variant="outline"
              onClick={() => loadMore()}
              disabled={isFetchingNextPage}
              className="w-full mt-4"
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load More'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignHistory;
