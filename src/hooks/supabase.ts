import { createClient } from '@supabase/supabase-js'
import type { PastBroadcast, BroadcastSentDetail } from 'apis/broadcastApi'
import { useEffect, useState } from 'react'
import { useAnonKey } from '../providers/ws'
import type { InfiniteData } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

type MessagePayload = Omit<PastBroadcast, 'id'>
interface RealtimeMessage {
  event: string
  type: string
  payload: BroadcastSentDetail
}

// const useSubscribeMostRecentBroadcastDetail = (): BroadcastSentDetail | undefined => {
//   const [mostRecentBroadcastDetails, setMostRecentBroadcastDetails] = useState<BroadcastSentDetail | undefined>()
//   const anonKey = useAnonKey()
//   if (!anonKey.anonKey) {
//     return undefined
//   }
//   console.log('creating client')
//   const client = createClient(import.meta.env.VITE_SUPABASE_URL as string, anonKey.anonKey)
//
//   const channel = client.channel('most-recent-broadcast')
//   channel
//     .on('broadcast', { event: 'details' }, (message: RealtimeMessage) => setMostRecentBroadcastDetails(message.payload))
//     .subscribe()
//
//   return mostRecentBroadcastDetails
// }

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
          setMostRecentBroadcastDetails(message.payload)
          // eslint-disable-next-line consistent-return
          queryClient.setQueryData<InfiniteData<PastBroadcast[]>>(['pastBroadcasts'], oldData => {
            if (oldData?.pages && oldData.pages.length > 0) {
              // Additional checks for pages
              const { pages } = oldData
              const firstPage = pages[0] as unknown as PastBroadcast[] // Access pages[0] directly
              const payload = message.payload as MessagePayload

              if (firstPage.length > 0) {
                // Additional check for firstPage
                const copiedFirstPage = [...firstPage] // Copy the first page
                if (copiedFirstPage[0]) {
                  copiedFirstPage[0] = {
                    ...copiedFirstPage[0],
                    ...payload // Assuming message.payload is of type MessagePayload
                  }
                }
                const newData = [copiedFirstPage, ...pages.slice(1)]

                return {
                  ...oldData,
                  pages: newData
                }
              }
              return oldData
            }
          })
        })
        .subscribe()
    }
  }, [anonKey])

  return mostRecentBroadcastDetails
}

export default useSubscribeMostRecentBroadcastDetail
