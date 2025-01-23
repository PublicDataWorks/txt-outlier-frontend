import axios from '@/lib/axios';

interface UpcomingBroadcast {
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
