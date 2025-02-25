import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface Campaign {
  id: string;
  title: string;
  date: Date;
  segments: string[];
  estimatedRecipients: number;
  message: string;
  followUpMessage: string;
}

const initialMockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Property Tax Reminder',
    date: new Date('2025-02-15T09:00:00'),
    segments: ['PROPERTY TAXES', 'HOMEOWNERS'],
    estimatedRecipients: 15000,
    message: "Don't forget to pay your property taxes by the end of the month.",
    followUpMessage:
      'This is a final reminder about your property taxes due this month.',
  },
  {
    id: '2',
    title: 'Rental Assistance Update',
    date: new Date('2025-02-20T10:00:00'),
    segments: ['HOUSING', 'LANDLORD'],
    estimatedRecipients: 8000,
    message: "There's an update regarding rental assistance programs.",
    followUpMessage: 'Check out the latest information on rental assistance.',
  },
  {
    id: '3',
    title: 'Election Day Reminder',
    date: new Date('2025-02-25T08:00:00'),
    segments: ['ELECTIONS'],
    estimatedRecipients: 25000,
    message: 'Remember to vote on Election Day!',
    followUpMessage: "Don't forget to cast your vote!",
  },
];

export interface Campaign {
  id: string;
  title: string;
  date: Date;
  segments: string[];
  estimatedRecipients: number;
  message: string;
  followUpMessage: string;
}

export default function UpcomingCampaigns() {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const onEditCampaign = (a) => {
    console.log(a);
  };

  const displayedCampaigns = expanded
    ? initialMockCampaigns
    : initialMockCampaigns.slice(0, 3);

  const truncateSegments = (segments: string[]) => {
    const joinedSegments = segments.join(', ');
    return joinedSegments.length > 30
      ? joinedSegments.slice(0, 30) + '...'
      : joinedSegments;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        Upcoming Campaigns ({initialMockCampaigns.length})
      </h3>
      <div className="space-y-2">
        {displayedCampaigns.map((campaign) => (
          <Card
            key={campaign.id}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onEditCampaign(campaign)}
          >
            <CardContent className="p-2">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className="font-medium text-sm">{campaign.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.date.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {truncateSegments(campaign.segments)}
                  </p>
                </div>
                <div className="flex items-center ml-2 text-muted-foreground">
                  <p className="text-xs mr-1">
                    ~{campaign.estimatedRecipients.toLocaleString()}
                  </p>
                  <Users className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {initialMockCampaigns.length > 3 && (
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
    </div>
  );
}
