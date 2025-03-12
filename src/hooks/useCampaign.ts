import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCampaign,
  CreateCampaignPayload,
  deleteCampaign,
  getCampaigns,
  getRecipientCount,
  RecipientCountPayload,
  updateCampaign,
  UpdateCampaignPayload,
  Campaign
} from '@/apis/campaigns';

export function useUpcomingCampaigns() {
  return useQuery({
    queryKey: ['upcomingCampaigns'],
    queryFn: async () => {
      const response = await getCampaigns(1);
      return response.upcoming;
    },
  });
}

export function usePastCampaigns(pageSize: number = 10) {
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['pastCampaigns', pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getCampaigns(pageSize, pageParam);
      return response.past;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPageParam < lastPage.pagination.totalPages
        ? lastPageParam + 1
        : undefined;
    },
  });

  // Flatten the pages of campaigns into a single array
  const campaigns = infiniteQuery.data?.pages.flatMap(page => page.items) || [];

  // Get the pagination data from the latest page
  const pagination = infiniteQuery.data?.pages[infiniteQuery.data.pages.length - 1]?.pagination;

  return {
    ...infiniteQuery,
    campaigns,
    pagination,
    hasNextPage: infiniteQuery.hasNextPage,
    loadMore: infiniteQuery.fetchNextPage,
  };
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCampaign: CreateCampaignPayload) => createCampaign(newCampaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['pastCampaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaign: Campaign) => {
      // Extract the data we need to send to the API
      // We don't want to send the id in the payload
      const { id, ...campaignData } = campaign;
      return updateCampaign(id, campaignData as UpdateCampaignPayload);
    },
    onSuccess: (_, variables) => {
      // After successful update, update the cache
      queryClient.invalidateQueries({ queryKey: ['upcomingCampaigns'] });

      // Optionally update the specific campaign in the cache to avoid a refetch
      queryClient.setQueryData(['upcomingCampaigns'], (oldData: Campaign[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(campaign =>
          campaign.id === variables.id ? variables : campaign
        );
      });
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
    }
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCampaign(id),
    onSuccess: (_, id) => {
      // After successful deletion, update the cache
      queryClient.invalidateQueries({ queryKey: ['upcomingCampaigns'] });

      // Optionally remove the campaign from the cache to avoid a refetch
      queryClient.setQueryData(['upcomingCampaigns'], (oldData: Campaign[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(campaign => campaign.id !== id);
      });
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
    }
  });
}

export function useRecipientCount() {
  return useMutation({
    mutationFn: (payload: RecipientCountPayload) => getRecipientCount(payload),
    onError: (error) => {
      console.error('Error counting recipients:', error);
    }
  });
}
