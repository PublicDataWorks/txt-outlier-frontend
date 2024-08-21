import { createClient } from '@supabase/supabase-js'
import type { PastBroadcast, BroadcastSentDetail } from 'apis/broadcastApi'
import { useEffect, useState } from 'react'
import { useAnonKey } from '../providers/ws'
import type { InfiniteData } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'

interface RealtimeMessage {
  event: string
  type: string
  payload: BroadcastSentDetail
}

const useSubscribeMostRecentBroadcastDetail = (): BroadcastSentDetail | undefined => {
  const [mostRecentBroadcastDetails, setMostRecentBroadcastDetails] = useState<BroadcastSentDetail | undefined>()
  const anonKey = useAnonKey()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (anonKey.anonKey) {
      const client = createClient(import.meta.env.VITE_SUPABASE_URL as string, anonKey.anonKey)

      const channel = client.channel('most-recent-broadcast')
      channel
        .on('broadcast', { event: 'details' }, (message: RealtimeMessage) => {
          setMostRecentBroadcastDetails({ ...mostRecentBroadcastDetails, ...message.payload })

          queryClient.setQueryData<InfiniteData<AxiosResponse<{ past: Partial<PastBroadcast>[] }>>>(
            ['pastBroadcasts'],
            // eslint-disable-next-line consistent-return
            oldData => {
              if (oldData?.pages && oldData.pages.length > 0) {
                const clonedOldData = { ...oldData } // clone old data
                const firstPage = clonedOldData.pages[0] as unknown as AxiosResponse<{ past: Partial<PastBroadcast>[] }>
                if (firstPage.data.past.length > 0) {
                  const clonedFirstPage = { ...firstPage } // clone first page
                  const clonedPast = [...clonedFirstPage.data.past] // clone first page past
                  clonedPast[0] = { ...clonedPast[0], ...message.payload } // update first past element with new data

                  clonedFirstPage.data.past = clonedPast // Replace the new past in first page
                  clonedOldData.pages[0] = clonedFirstPage // Change the first page in the old data

                  return clonedOldData
                }
                return oldData
              }
            }
          )
        })
        .subscribe()
    }
  }, [anonKey])

  return mostRecentBroadcastDetails
}

export default useSubscribeMostRecentBroadcastDetail
