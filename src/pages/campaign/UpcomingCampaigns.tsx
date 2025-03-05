import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useState } from 'react';

import { Campaign, Segment as CampaignSegment } from '@/apis/campaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpcomingCampaigns } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { unixTimestampInSecondToDate } from '@/lib/date';

export default function UpcomingCampaigns() {
  const [expanded, setExpanded] = useState(false);
  const {
    data: campaigns = [],
    isPending,
    isError,
    error,
  } = useUpcomingCampaigns();

  // Use the existing useSegments hook
  const { data: segmentsData = [] } = useSegments();

  // Create a map of segment IDs to segment names for quick lookup
  const segmentMap = new Map<string, string>();
  segmentsData.forEach((segment) => {
    segmentMap.set(segment.id, segment.name);
  });

  const toggleExpand = () => setExpanded(!expanded);

  const displayedCampaigns = expanded ? campaigns : campaigns.slice(0, 3);

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

    const joinedSegments = segmentNames.join(', ');
    return joinedSegments.length > 30
      ? joinedSegments.slice(0, 30) + '...'
      : joinedSegments;
  };

  if (isPending) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Upcoming Campaigns</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-2">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Upcoming Campaigns</h3>
        <Card className="bg-red-50">
          <CardContent className="text-sm p-4 text-red-500">
            Error loading campaigns: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        Upcoming Campaigns ({campaigns.length})
      </h3>
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No upcoming campaigns scheduled
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {displayedCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <CardContent className="p-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="font-medium text-sm">
                        {campaign.title || 'Untitled Campaign'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {unixTimestampInSecondToDate(campaign.runAt)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getSegmentNames(campaign.segments)}
                      </p>
                    </div>
                    <div className="flex items-center ml-2 text-muted-foreground">
                      <p className="text-xs mr-1">
                        ~{campaign.recipientCount.toLocaleString()}
                      </p>
                      <Users className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {campaigns.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="w-full"
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show More
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
