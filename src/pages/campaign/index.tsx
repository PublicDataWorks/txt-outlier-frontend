import NewCampaign from './NewCampaign';
import UpcomingCampaigns from './UpcomingCampaigns';

import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';

const CampaignPage = () => {
  return (
    <>
      <UpcomingCampaigns />
      <Tabs defaultValue="new-campaign" className="w-full max-w-none">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="new-campaign"> New Campaing </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="new-campaign">
          <NewCampaign />
        </TabsContent>
        <TabsContent value="history">History</TabsContent>
      </Tabs>
    </>
  );
};

export default CampaignPage;
