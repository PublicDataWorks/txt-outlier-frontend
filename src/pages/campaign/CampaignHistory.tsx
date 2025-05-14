import { Users, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Campaign, Segment as CampaignSegment } from '@/apis/campaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePastCampaigns } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { unixTimestampInSecondToDate } from '@/lib/date';

const CampaignHistory = () => {
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(
    null
  );
  const [campaignsWithLabels, setCampaignsWithLabels] = useState<Campaign[]>([]);

  const {
    campaigns,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    loadMore,
    pagination
  } = usePastCampaigns(10);

  // Use the existing useSegments hook
  const { data: segmentsData = [] } = useSegments();

  // Create a map of segment IDs to segment names for quick lookup
  const segmentMap = new Map<string, string>();
  segmentsData.forEach((segment) => {
    segmentMap.set(segment.id, segment.name);
  });

  // Initialize campaigns and fetch label names if needed
  useEffect(() => {
    if (campaigns.length === 0) return;

    const fetchLabels = async () => {
      // First, try to fetch all labels at once to avoid multiple API calls
      let missiveLabels: { id: string; name: string; parent_id: string }[] = [];
      try {
        missiveLabels = await Missive.fetchLabels();
      } catch (error) {
        console.error('Error fetching Missive labels:', error);
      }
      
      const labelLookup: Record<string, string> = {};
      missiveLabels.forEach(label => {
        if (label.id && label.name) {
          labelLookup[label.id] = label.name;
        }
      });

      const updatedCampaigns = campaigns.map(campaign => {
        if (campaign.labelIds && campaign.labelIds.length > 0) {
          const labelNames = campaign.labelIds
            .map(labelId => labelLookup[labelId])
            .filter(Boolean) as string[];
          
          return {
            ...campaign, 
            campaignLabelNames: labelNames
          };
        }
        return campaign;
      });

      setCampaignsWithLabels(updatedCampaigns);
    };
    void fetchLabels();
  }, [campaigns]);

  const toggleExpand = (campaignId: number) => {
    setExpandedCampaignId(
      expandedCampaignId === campaignId ? null : campaignId
    );
  };

  // Properly typed function to extract segment names
  const getSegmentNames = (segments: Campaign['segments']) => {
    if (!segments || !segments.included) return 'Uploaded via CSV file';

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
            {campaignsWithLabels.map((campaign) => (
              <Card
                key={campaign.id}
                className="overflow-hidden cursor-pointer  hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <CardContent className="p-4">
                  <div
                    className="grid grid-cols-[1fr_auto] gap-4"
                    onClick={() => toggleExpand(campaign.id)}
                  >
                    {/* Left side with campaign details - will truncate as needed */}
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                        {campaign.title || 'Untitled Campaign'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {unixTimestampInSecondToDate(campaign.runAt)}
                        {campaign.campaignLabelNames && campaign.campaignLabelNames.length > 0 && (
                          <div className="w-full mt-1 flex">
                            {campaign.campaignLabelNames.map((labelName, idx) => (
                              <span key={idx} className="mr-1 mb-1 inline-flex items-center bg-muted rounded px-1.5 py-0.5 text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {labelName}
                              </span>
                            ))}
                          </div>
                        )}
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
                        <h4 className="text-sm font-medium mb-2">Message:</h4>
                        <p className="break-words">{campaign.firstMessage}</p>
                      </div>
                      {campaign.secondMessage && (
                        <div className="bg-muted p-3 rounded-md">
                          <h4 className="text-sm font-medium mb-2">
                            Follow-up Message:
                          </h4>
                          <p className="break-words">
                            {campaign.secondMessage}
                          </p>
                        </div>
                      )}

                      <div className="bg-muted p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">
                          Response breakdown:
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">
                              Conversation starters sent:
                            </p>
                            {campaign.firstMessageCount}
                          </div>
                          {campaign.secondMessage && (
                            <div>
                              <p className="font-medium">
                                Second Message Count:
                              </p>
                              {campaign.secondMessageCount}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              Delivered successfully:
                            </p>
                            {campaign.successfulDeliveries}
                          </div>
                          <div>
                            <p className="font-medium">Failed to deliver:</p>
                            {campaign.failedDeliveries}
                          </div>

                          <div>
                            <p className="font-medium">
                              Unsubscribed:
                            </p>
                            {campaign.unsubscribes}
                          </div>
                        </div>
                      </div>
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
