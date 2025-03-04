import { Separator } from '@radix-ui/react-select';

import NewCampaign from './NewCampaign';
import { ScheduleDialog } from './ScheduleDialog';
import { SendNowDialog } from './SendNowDialog';
import UpcomingCampaigns from './UpcomingCampaigns';

const CampaignPage = () => {
  return (
    <>
      <UpcomingCampaigns />
      <NewCampaign />
      <Separator className="shrink-0 bg-border h-[1px] w-full" />
      <div className="flex gap-2">
        <ScheduleDialog onSchedule={() => {}} />
        <SendNowDialog
          onSend={() => {}}
          recipientCount={200}
          segmentDescription="aa"
          messagePreview="aa"
        />
      </div>
    </>
  );
};

export default CampaignPage;
