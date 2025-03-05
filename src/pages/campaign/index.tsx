import CampaignHistory from './CampaignHistory';
import NewCampaign from './NewCampaign';
import UpcomingCampaigns from './UpcomingCampaigns';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CampaignPage = () => {
  return (
    <div className="space-y-6">
      <UpcomingCampaigns />

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Campaign</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <NewCampaign />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <CampaignHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignPage;
