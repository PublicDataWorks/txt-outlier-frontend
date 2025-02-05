import axios from '@/lib/axios';

const BROADCAST_SIDEBAR = '/broadcast-sidebar/';
const SEND_NOW = '/send-now/';

export interface UpcomingBroadcast {
  id: number;
  firstMessage: string;
  secondMessage: string;
  runAt: number;
  delay: string;
  noRecipients: number;
}

interface PastBroadcast {
  id: number;
  firstMessage: string;
  secondMessage: string;
  runAt: number;
  totalFirstSent: number;
  totalSecondSent: number;
  successfullyDelivered: number;
  failedDelivered: number;
  totalUnsubscribed: number;
}

interface BroadcastsResponse {
  upcoming: UpcomingBroadcast;
  past: PastBroadcast[];
  currentCursor: number;
}

export const getBroadcasts = async (): Promise<BroadcastsResponse> => {
  const response = await axios.get<BroadcastsResponse>(BROADCAST_SIDEBAR);
  return response.data;
};

export const updateBroadcast = async ({
  id,
  firstMessage,
  secondMessage,
  runAt
}: Partial<UpcomingBroadcast>): Promise<UpcomingBroadcast> =>
  axios.patch(BROADCAST_SIDEBAR, {
    id,
    firstMessage,
    secondMessage,
    runAt
  });

export const sendNowBroadcast = async (): Promise<void> => axios.get(SEND_NOW);
