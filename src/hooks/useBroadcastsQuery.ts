import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import { getBroadcasts, updateBroadcast, UpcomingBroadcast, BroadcastsResponse } from '@/apis/broadcasts';


export const BROADCASTS_QUERY_KEY = ['broadcasts'];
export const PAST_BROADCASTS_QUERY_KEY = ['past-broadcasts'];


export const useBroadcastsQuery = () => {
  return useQuery({
    queryKey: BROADCASTS_QUERY_KEY,
    queryFn: () => getBroadcasts(),
  });
};

export const usePastBroadcastsQuery = () => {
  return useInfiniteQuery<
    BroadcastsResponse,
    Error,
    InfiniteData<BroadcastsResponse>,
    string[],
    number | undefined
  >({
    queryKey: PAST_BROADCASTS_QUERY_KEY,
    queryFn: ({ pageParam }) => getBroadcasts(pageParam),
    getNextPageParam: (lastPage) => lastPage.currentCursor || undefined,
    initialPageParam: undefined,
  });
};


export const useBroadcastMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UpcomingBroadcast>) => {
      return await updateBroadcast(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BROADCASTS_QUERY_KEY });
    }
  });
};
