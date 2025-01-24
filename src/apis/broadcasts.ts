import axios from '@/lib/axios';

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
  const response = await axios.get<BroadcastsResponse>('/broadcasts');
  return response.data;
};

export const updateBroadcast = async ({
  id,
  firstMessage,
  secondMessage,
  runAt
}: Partial<UpcomingBroadcast>): Promise<UpcomingBroadcast> =>
  axios.patch(`broadcasts/${id}`, {
    firstMessage,
    secondMessage,
    runAt
  });
