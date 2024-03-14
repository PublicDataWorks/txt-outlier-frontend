import {
  ITEMS_PER_PAGE,
  type UpdateBroadcast,
  getBroadcastDashboard,
  getPastBroadcasts,
  updateBroadcast,
  type BroadcastDashboard
} from '../apis/broadcastApi'
import { type QueryClient, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

function isBroadcastDataEqual(
  oldData: AxiosResponse<BroadcastDashboard> | undefined,
  newData: AxiosResponse<BroadcastDashboard>
) {
  return !!(oldData && oldData.data.upcoming.id === newData.data.upcoming.id)
}

const useBroadcastDashboardQuery = (queryClient: QueryClient) =>
  useQuery({
    queryKey: ['broadcastDashboard'],
    queryFn: getBroadcastDashboard,
    structuralSharing: (
      oldData: AxiosResponse<BroadcastDashboard> | undefined,
      newData: AxiosResponse<BroadcastDashboard>
    ) => {
      if (!isBroadcastDataEqual(oldData, newData)) {
        void queryClient.invalidateQueries({ queryKey: ['pastBroadcasts'] })
      }
      return newData
    }
  })
const usePastBroadcastsQuery = initialData =>
  useInfiniteQuery({
    queryKey: ['pastBroadcasts'],
    queryFn: getPastBroadcasts,
    initialPageParam: undefined,
    getNextPageParam: lastPage =>
      lastPage.data.past.length === ITEMS_PER_PAGE ? lastPage.data.currentCursor : undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    initialData,
    staleTime: 24 * 60 * 60 * 1000
  })

const useUpdateBroadcast = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: async (newData: UpdateBroadcast) => updateBroadcast(newData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['broadcastDashboard'] })
      await Missive.closeForm()
      // TODO: remove await
      // Get new content from response
    }
  })

export { useBroadcastDashboardQuery, useUpdateBroadcast, usePastBroadcastsQuery }
