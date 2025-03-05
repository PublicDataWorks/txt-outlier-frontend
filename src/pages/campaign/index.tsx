import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewCampaign from './NewCampaign';
import UpcomingCampaigns from './UpcomingCampaigns';
import CampaignHistory from './CampaignHistory'; // You'll need to create this component

const CampaignPage = () => {
  return (
    <div className="space-y-6">
      <UpcomingCampaigns />

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Campaign</TabsTrigger>
          <TabsTrigger value="history">Campaign History</TabsTrigger>
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
