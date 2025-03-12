import { format } from 'date-fns';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Save,
  Trash2,
  Plus,
  X,
  Filter,
} from 'lucide-react';
import { useState, useCallback, useEffect, useMemo } from 'react';

import { ConfirmationModal } from './ConfirmationModal';

import { Campaign, Segment as CampaignSegment } from '@/apis/campaigns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useUpcomingCampaigns,
  useUpdateCampaign,
  useDeleteCampaign,
} from '@/hooks/useCampaign';
import { useSegments } from '@/hooks/useSegments';
import { cn } from '@/lib/utils';

export default function UpcomingCampaigns() {
  const [expandedView, setExpandedView] = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(
    null,
  );
  const [editedCampaigns, setEditedCampaigns] = useState<
    Record<number, Campaign>
  >({});
  const [hasChanges, setHasChanges] = useState<Record<number, boolean>>({});
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const [campaignToSave, setCampaignToSave] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);
  const [campaignToSwitch, setCampaignToSwitch] = useState<number | null>(null);
  const [removeFollowUpConfirmOpen, setRemoveFollowUpConfirmOpen] =
    useState(false);
  const [campaignToRemoveFollowUp, setCampaignToRemoveFollowUp] = useState<
    number | null
  >(null);

  // Fetch campaigns and segments
  const {
    data: campaigns = [],
    isPending,
    isError,
    error,
  } = useUpcomingCampaigns();

  // Mutation hooks
  const updateCampaignMutation = useUpdateCampaign();
  const deleteCampaignMutation = useDeleteCampaign();

  // Use the existing useSegments hook
  const { data: segmentsData = [] } = useSegments();

  const segmentMap = useMemo(() => {
    const map = new Map<string, string>();
    segmentsData.forEach((segment) => {
      map.set(segment.id, segment.name);
    });
    return map;
  }, [segmentsData]);

  // Initialize edited campaigns
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const initialEdited: Record<number, Campaign> = {};
      campaigns.forEach((campaign) => {
        initialEdited[campaign.id] = { ...campaign };
      });
      setEditedCampaigns(initialEdited);
    }
  }, [campaigns]);

  const toggleExpandView = () => setExpandedView(!expandedView);

  const toggleExpandCard = useCallback(
    (campaignId: number) => {
      const currentlyExpandedId = expandedCampaignId;
      const hasUnsavedChanges =
        currentlyExpandedId !== null && hasChanges[currentlyExpandedId];

      if (hasUnsavedChanges && campaignId !== currentlyExpandedId) {
        setCampaignToSwitch(campaignId);
        setUnsavedChangesModalOpen(true);
        return;
      }

      setExpandedCampaignId(
        campaignId === expandedCampaignId ? null : campaignId,
      );
    },
    [expandedCampaignId, hasChanges],
  );

  // Using the original logic for displayedCampaigns
  const displayedCampaigns = expandedView ? campaigns : campaigns.slice(0, 3);

  const handleInputChange = useCallback(
    (campaignId: number, field: keyof Campaign, value: any) => {
      setEditedCampaigns((prev) => ({
        ...prev,
        [campaignId]: {
          ...prev[campaignId],
          [field]: value,
        },
      }));
      setHasChanges((prev) => ({
        ...prev,
        [campaignId]: true,
      }));
    },
    [],
  );

  const handleAddFollowUp = useCallback((campaignId: number) => {
    setEditedCampaigns((prev) => ({
      ...prev,
      [campaignId]: {
        ...prev[campaignId],
        secondMessage: '',
        delay: 600,
      },
    }));
    setHasChanges((prev) => ({
      ...prev,
      [campaignId]: true,
    }));
  }, []);

  const handleRemoveFollowUp = useCallback((campaignId: number) => {
    setCampaignToRemoveFollowUp(campaignId);
    setRemoveFollowUpConfirmOpen(true);
  }, []);

  const confirmRemoveFollowUp = useCallback(() => {
    if (campaignToRemoveFollowUp) {
      setEditedCampaigns((prev) => ({
        ...prev,
        [campaignToRemoveFollowUp]: {
          ...prev[campaignToRemoveFollowUp],
          secondMessage: null,
          delay: 600,
        },
      }));
      setHasChanges((prev) => ({
        ...prev,
        [campaignToRemoveFollowUp]: true,
      }));
      setCampaignToRemoveFollowUp(null);
    }
    setRemoveFollowUpConfirmOpen(false);
  }, [campaignToRemoveFollowUp]);

  const handleSave = useCallback((campaign: Campaign) => {
    setCampaignToSave(campaign);
    setSaveConfirmOpen(true);
  }, []);

  const confirmSave = useCallback(() => {
    if (campaignToSave) {
      updateCampaignMutation.mutate(campaignToSave, {
        onSuccess: () => {
          setHasChanges((prev) => ({
            ...prev,
            [campaignToSave.id]: false,
          }));
        },
      });
    }
    setSaveConfirmOpen(false);
  }, [campaignToSave, updateCampaignMutation]);

  const handleDelete = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking delete
    setCampaignToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (campaignToDelete) {
      deleteCampaignMutation.mutate(campaignToDelete);
      setExpandedCampaignId(null);
    }
    setDeleteConfirmOpen(false);
  }, [campaignToDelete, deleteCampaignMutation]);

  const handleUnsavedChanges = useCallback(
    (action: 'save' | 'discard') => {
      if (expandedCampaignId) {
        if (action === 'save') {
          updateCampaignMutation.mutate(editedCampaigns[expandedCampaignId]);
        } else {
          // Reset to original campaign data
          setEditedCampaigns((prev) => ({
            ...prev,
            [expandedCampaignId]:
              campaigns.find((c) => c.id === expandedCampaignId) ||
              prev[expandedCampaignId],
          }));
        }
        setHasChanges((prev) => ({ ...prev, [expandedCampaignId]: false }));
      }
      setExpandedCampaignId(campaignToSwitch);
      setCampaignToSwitch(null);
      setUnsavedChangesModalOpen(false);
    },
    [
      expandedCampaignId,
      campaignToSwitch,
      editedCampaigns,
      campaigns,
      updateCampaignMutation,
    ],
  );

  // Function to render a segment badge with proper styling
  const renderSegmentBadge = useCallback(
    (segment: CampaignSegment, isExclusion = false) => {
      const segmentName = segmentMap.get(segment.id) || segment.id;
      const hasSince = segment.since && segment.since > 0;

      return (
        <Badge
          variant="outline"
          className={cn(
            'mr-1 mb-1 text-xs inline-flex items-center',
            isExclusion && 'border-destructive text-destructive',
          )}
        >
          {segmentName}
          {hasSince && (
            <span className="ml-1 text-muted-foreground text-[10px]">
              since {format(new Date(segment.since * 1000), 'MMM d, yyyy')}
            </span>
          )}
        </Badge>
      );
    },
    [segmentMap],
  );

  // Function to process segment groups (for nested segments with filters)
  const renderSegmentGroup = useCallback(
    (
      segments: Array<CampaignSegment | CampaignSegment[]>,
      isExclusion = false,
    ) => {
      return segments.map((item, index) => {
        if (Array.isArray(item)) {
          // This is a group with filters
          const baseSegment = item[0];
          const filters = item.slice(1);

          return (
            <Badge
              key={`group-${index}`}
              variant="outline"
              className={cn(
                'mr-1 mb-1 text-xs inline-flex items-center',
                isExclusion && 'border-destructive text-destructive',
              )}
            >
              {segmentMap.get(baseSegment.id) || baseSegment.id}
              {baseSegment.since && baseSegment.since > 0 && (
                <span className="ml-1 text-muted-foreground text-[10px]">
                  since{' '}
                  {format(new Date(baseSegment.since * 1000), 'MMM d, yyyy')}
                </span>
              )}
              {filters.length > 0 && (
                <>
                  <Filter className="h-3 w-3 mx-1" />
                  {filters.map((filter, idx) => (
                    <span key={idx} className="mr-1">
                      {segmentMap.get(filter.id) || filter.id}
                      {filter.since && filter.since > 0 && (
                        <span className="ml-1 text-muted-foreground text-[10px]">
                          since{' '}
                          {format(new Date(filter.since * 1000), 'MMM d, yyyy')}
                        </span>
                      )}
                      {idx < filters.length - 1 && ', '}
                    </span>
                  ))}
                </>
              )}
            </Badge>
          );
        } else {
          // This is a single segment
          return (
            <span key={`segment-${index}`}>
              {renderSegmentBadge(item, isExclusion)}
            </span>
          );
        }
      });
    },
    [renderSegmentBadge, segmentMap],
  );

  // Function to count SMS messages
  const countSmsMessages = (text: string) => {
    return Math.ceil(text.length / 160);
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
    <div className="space-y-2" data-testid="upcoming-campaigns-container">
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
              const editedCampaign = editedCampaigns[campaign.id] || campaign;
              const hasChanged = hasChanges[campaign.id] || false;

              // Convert delay from seconds to minutes for display
              const delayInMinutes = Math.round(
                (editedCampaign.delay || 0) / 60,
              );

              return (
                <Card
                  key={campaign.id}
                  data-component="campaign-card"
                  data-campaign-id={campaign.id}
                  className={cn(
                    'bg-primary/5 border-primary/20 transition-all duration-200 ease-in-out',
                    expandedCampaignId === campaign.id
                      ? 'ring-2 ring-primary'
                      : '',
                    hasChanged ? 'border-amber-400' : '',
                  )}
                >
                  <CardContent className="p-0">
                    {/* Header section - clickable to toggle expansion */}
                    <div
                      className="p-3 cursor-pointer"
                      onClick={() => toggleExpandCard(campaign.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <h4 className="font-medium text-primary text-sm">
                            {editedCampaign.title || 'Untitled Campaign'}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(
                              new Date(editedCampaign.runAt * 1000),
                              'MMM d, yyyy',
                            )}
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            {format(
                              new Date(editedCampaign.runAt * 1000),
                              'h:mm a',
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap">
                            {editedCampaign.segments.included &&
                              renderSegmentGroup(
                                editedCampaign.segments.included,
                              )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {editedCampaign.recipientCount.toLocaleString()}
                          </p>
                          {expandedCampaignId === campaign.id ? (
                            <ChevronUp className="h-4 w-4 mt-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded content - not clickable for collapse */}
                    {expandedCampaignId === campaign.id && (
                      <div
                        className="p-3 border-t space-y-4 bg-background"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          <div>
                            <label
                              htmlFor={`title-${campaign.id}`}
                              className="text-xs font-medium"
                            >
                              Campaign Title
                            </label>
                            <Input
                              id={`title-${campaign.id}`}
                              value={
                                editedCampaign.title || 'Untitled Campaign'
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  campaign.id,
                                  'title',
                                  e.target.value,
                                )
                              }
                              className="mt-1 text-sm"
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
                              value={format(
                                new Date(editedCampaign.runAt * 1000),
                                "yyyy-MM-dd'T'HH:mm",
                              )}
                              onChange={(e) => {
                                const date = new Date(e.target.value);
                                const timestamp = Math.floor(
                                  date.getTime() / 1000,
                                );
                                handleInputChange(
                                  campaign.id,
                                  'runAt',
                                  timestamp,
                                );
                              }}
                              className="mt-1 text-sm"
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
                              value={editedCampaign.firstMessage}
                              onChange={(e) =>
                                handleInputChange(
                                  campaign.id,
                                  'firstMessage',
                                  e.target.value,
                                )
                              }
                              rows={2}
                              className="mt-1 text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {countSmsMessages(editedCampaign.firstMessage)}{' '}
                              SMS message
                              {countSmsMessages(editedCampaign.firstMessage) !==
                              1
                                ? 's'
                                : ''}
                            </p>
                          </div>

                          {editedCampaign.secondMessage !== null &&
                          editedCampaign.secondMessage !== undefined ? (
                            <div>
                              <div className="flex justify-between items-center">
                                <label
                                  htmlFor={`followup-${campaign.id}`}
                                  className="text-xs font-medium"
                                >
                                  Follow-up Message
                                </label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveFollowUp(campaign.id)
                                  }
                                  className="h-6 px-2"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                              <Textarea
                                id={`followup-${campaign.id}`}
                                value={editedCampaign.secondMessage}
                                onChange={(e) =>
                                  handleInputChange(
                                    campaign.id,
                                    'secondMessage',
                                    e.target.value,
                                  )
                                }
                                rows={2}
                                className="mt-1 text-sm"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {countSmsMessages(editedCampaign.secondMessage)}{' '}
                                SMS message
                                {countSmsMessages(
                                  editedCampaign.secondMessage,
                                ) !== 1
                                  ? 's'
                                  : ''}
                              </p>
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
                                  onChange={(e) => {
                                    const minutes = parseInt(
                                      e.target.value,
                                      10,
                                    );
                                    const seconds = minutes * 60; // Convert to seconds for API
                                    handleInputChange(
                                      campaign.id,
                                      'delay',
                                      seconds,
                                    );
                                  }}
                                  className="mt-1 text-sm"
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddFollowUp(campaign.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Follow-up Message
                            </Button>
                          )}

                          {/* Segments and Filters Section */}
                          <div className="space-y-3">
                            {/* Target Segments */}
                            <div>
                              <h5 className="text-xs font-medium mb-1">
                                Target Segments
                              </h5>
                              <div className="flex flex-wrap">
                                {editedCampaign.segments.included &&
                                  renderSegmentGroup(
                                    editedCampaign.segments.included,
                                  )}
                              </div>
                            </div>

                            {/* Exclusions */}
                            {editedCampaign.segments.excluded &&
                              editedCampaign.segments.excluded.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium mb-1">
                                    Exclusions
                                  </h5>
                                  <div className="flex flex-wrap">
                                    {renderSegmentGroup(
                                      editedCampaign.segments.excluded,
                                      true,
                                    )}
                                  </div>
                                </div>
                              )}
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
                              value={`${editedCampaign.recipientCount.toLocaleString()} users`}
                              readOnly
                              className="mt-1 text-sm bg-muted/40"
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => handleDelete(campaign.id, e)}
                            className="h-8"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Campaign
                          </Button>

                          {hasChanged && (
                            <Button
                              size="sm"
                              onClick={() => handleSave(editedCampaign)}
                              className="flex items-center h-8"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save Changes
                            </Button>
                          )}
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

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title="Save Campaign Changes"
        description="Are you sure you want to save the changes to this campaign?"
        confirmText="Save Changes"
        cancelText="Cancel"
        onConfirm={confirmSave}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmText="Delete Campaign"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Unsaved Changes Warning Modal */}
      <ConfirmationModal
        open={unsavedChangesModalOpen}
        onOpenChange={setUnsavedChangesModalOpen}
        title="Unsaved Changes"
        description="You have unsaved changes. What would you like to do?"
        confirmText="Save and Switch"
        cancelText="Keep Editing"
        showDiscardOption={true}
        onDiscard={() => handleUnsavedChanges('discard')}
        onConfirm={() => handleUnsavedChanges('save')}
      />

      {/* Remove Follow-up Confirmation Modal */}
      <ConfirmationModal
        open={removeFollowUpConfirmOpen}
        onOpenChange={setRemoveFollowUpConfirmOpen}
        title="Remove Follow-up Message"
        description="Are you sure you want to remove the follow-up message? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemoveFollowUp}
        variant="destructive"
      />
    </div>
  );
}
