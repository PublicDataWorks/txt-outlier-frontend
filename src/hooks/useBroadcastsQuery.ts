import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import { getBroadcasts, updateBroadcast, UpcomingBroadcast } from '@/apis/broadcasts';


export const BROADCASTS_QUERY_KEY = ['broadcasts'];


export const useBroadcastsQuery = () => {
  return useQuery({
    queryKey: BROADCASTS_QUERY_KEY,
    queryFn: getBroadcasts,
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
