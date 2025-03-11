import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { 
  createCampaign, 
  createCampaignWithFile,
  CreateCampaignPayload, 
  CreateCampaignFormData,
  getCampaigns, 
  getRecipientCount, 
  RecipientCountPayload 
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

export function useCreateCampaignWithFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: CreateCampaignFormData) => createCampaignWithFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['pastCampaigns'] });
    },
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
