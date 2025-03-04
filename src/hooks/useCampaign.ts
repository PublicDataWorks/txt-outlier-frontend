import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getCampaigns } from '@/apis/campaigns';

/**
 * Hook to fetch upcoming campaigns
 */
export function useUpcomingCampaigns() {
  return useQuery({
    queryKey: ['upcomingCampaigns'],
    queryFn: async () => {
      const response = await getCampaigns(1);
      return response.upcoming;
    },
  });
}

/**
 * Hook to fetch past campaigns with pagination support
 */
export function usePastCampaigns(pageSize: number = 10) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['pastCampaigns', page, pageSize],
    queryFn: async () => {
      const response = await getCampaigns(pageSize, page);
      return response.past;
    },
  });

  // In v5, we can destructure the data directly
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
