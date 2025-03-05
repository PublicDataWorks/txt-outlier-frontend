import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { createCampaign, CreateCampaignPayload, getCampaigns } from '@/apis/campaigns';

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
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['pastCampaigns', page, pageSize],
    queryFn: async () => {
      const response = await getCampaigns(pageSize, page);
      return response.past;
    },
  });

  const { data } = query;
  const pagination = data?.pagination;
  const campaigns = data?.items || [];

  return {
    ...query,
    // Pagination state and data
    page,
    setPage,
    pagination,
    campaigns,

    // Helper functions for pagination
    nextPage: () => setPage(old => Math.min(old + 1, pagination?.totalPages || old)),
    prevPage: () => setPage(old => Math.max(old - 1, 1)),
    goToPage: (pageNumber: number) => setPage(pageNumber),
    hasNextPage: page < (pagination?.totalPages || 0),
    hasPrevPage: page > 1,
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
