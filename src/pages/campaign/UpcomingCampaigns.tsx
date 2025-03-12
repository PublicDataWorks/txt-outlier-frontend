import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useState } from 'react';

import { Campaign, Segment as CampaignSegment } from '@/apis/campaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useUpcomingCampaigns } from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { unixTimestampInSecondToDate } from '@/lib/date';

export default function UpcomingCampaigns() {
  const [expandedView, setExpandedView] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(
    null,
  );

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

  const toggleExpandView = () => setExpandedView(!expandedView);

  const toggleExpandCard = (campaignId: number) => {
    setExpandedCampaignId(
      expandedCampaignId === campaignId ? null : campaignId,
    );
  };

  const displayedCampaigns = expandedView ? campaigns : campaigns.slice(0, 3);

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

  if (isPending) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold">Upcoming Campaigns</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <CardContent className="p-3">
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
        <h3 className="font-semibold">Upcoming Campaigns</h3>
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
      <h3 className="font-semibold">Upcoming Campaigns ({campaigns.length})</h3>
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No upcoming campaigns scheduled
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {displayedCampaigns.map((campaign) => {
              const campaignDate = unixTimestampInSecondToDate(campaign.runAt);

              // Convert delay from seconds to minutes
              const delayInMinutes = Math.round(campaign.delay / 60);

              return (
                <Card
                  key={campaign.id}
                  className="bg-primary/5 border-primary/20 transition-all duration-200 ease-in-out "
                >
                  <CardContent className="p-3">
                    {/* Header section - clickable to toggle expansion */}
                    <div
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => toggleExpandCard(campaign.id)}
                    >
                      <div className="flex-grow">
                        <h4 className="font-medium text-primary text-sm">
                          {campaign.title || 'Untitled Campaign'}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {campaignDate}
                        </div>
                        <p className="text-xs mt-1">
                          {getSegmentNames(campaign.segments)}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.recipientCount.toLocaleString()}
                        </p>
                        {expandedCampaignId === campaign.id ? (
                          <ChevronUp className="h-4 w-4 mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mt-1" />
                        )}
                      </div>
                    </div>

                    {/* Expanded content - not clickable for collapse */}
                    {expandedCampaignId === campaign.id && (
                      <div
                        className="mt-3 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <label
                            htmlFor={`title-${campaign.id}`}
                            className="text-xs font-medium"
                          >
                            Campaign Title
                          </label>
                          <Input
                            id={`title-${campaign.id}`}
                            value={campaign.title || 'Untitled Campaign'}
                            readOnly
                            className="mt-1 text-sm bg-muted/40"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`date-${campaign.id}`}
                            className="text-xs font-medium"
                          >
                            Campaign Date and Time
                          </label>
                          <Input
                            id={`date-${campaign.id}`}
                            type="datetime-local"
                            value={format(new Date(campaign.runAt * 1000), "yyyy-MM-dd'T'HH:mm")}
                            readOnly
                            className="mt-1 text-sm bg-muted/40"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`message-${campaign.id}`}
                            className="text-xs font-medium"
                          >
                            Message
                          </label>
                          <Textarea
                            id={`message-${campaign.id}`}
                            value={campaign.firstMessage}
                            readOnly
                            rows={2}
                            className="mt-1 text-sm bg-muted/40"
                          />
                        </div>

                        {campaign.secondMessage && (
                          <>
                            <div>
                              <label
                                htmlFor={`followup-${campaign.id}`}
                                className="text-xs font-medium"
                              >
                                Follow-up Message
                              </label>
                              <Textarea
                                id={`followup-${campaign.id}`}
                                value={campaign.secondMessage}
                                readOnly
                                rows={2}
                                className="mt-1 text-sm bg-muted/40"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`delay-${campaign.id}`}
                                className="text-xs font-medium"
                              >
                                Follow-up Delay (minutes)
                              </label>
                              <Input
                                id={`delay-${campaign.id}`}
                                type="number"
                                value={delayInMinutes}
                                readOnly
                                className="mt-1 text-sm bg-muted/40"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label
                            htmlFor={`segments-${campaign.id}`}
                            className="text-xs font-medium"
                          >
                            Segments
                          </label>
                          <Input
                            id={`segments-${campaign.id}`}
                            value={
                              getSegmentNames(campaign.segments) ||
                              'No segments specified'
                            }
                            readOnly
                            className="mt-1 text-sm bg-muted/40"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`recipients-${campaign.id}`}
                            className="text-xs font-medium"
                          >
                            Estimated Recipients
                          </label>
                          <Input
                            id={`recipients-${campaign.id}`}
                            value={`${campaign.recipientCount.toLocaleString()} users`}
                            readOnly
                            className="mt-1 text-sm bg-muted/40"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {campaigns.length > 3 && (
            <Button
              variant="link"
              size="sm"
              onClick={toggleExpandView}
              className="w-full"
            >
              {expandedView ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show {campaigns.length - 3} More
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
