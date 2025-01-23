import { useQuery } from '@tanstack/react-query';

import { getBroadcasts } from '@/apis/broadcasts';

export const BROADCASTS_QUERY_KEY = ['broadcasts'];


export const useBroadcastsQuery = () => {
  return useQuery({
    queryKey: BROADCASTS_QUERY_KEY,
    queryFn: getBroadcasts,
  });
};
