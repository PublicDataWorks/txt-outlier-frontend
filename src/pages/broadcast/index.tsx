import LastBatchSection from './LastBatchSection';
import NextBatchSection from './NextBatchSection';
import PastBroadcastsSection from './PastBroadcastsSection';

const BroadcastPage = () => {
  return (
    <>
      <NextBatchSection />
      <LastBatchSection />
      <PastBroadcastsSection />
    </>
  );
};

export default BroadcastPage;
