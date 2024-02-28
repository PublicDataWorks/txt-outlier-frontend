import { createClient } from '@supabase/supabase-js'
import type { BroadcastSentDetail } from 'apis/broadcastApi'
import { useState } from 'react'
import { useAnonKey } from '../providers/ws'

interface RealtimeMessage {
  event: string
  type: string
  payload: BroadcastSentDetail
}

const useSubscribeMostRecentBroadcastDetail = (): BroadcastSentDetail | undefined => {
  const [mostRecentBroadcastDetails, setMostRecentBroadcastDetails] = useState<BroadcastSentDetail | undefined>()
  const anonKey = useAnonKey()
  if (!anonKey.anonKey) {
    return undefined
  }
  const client = createClient(import.meta.env.VITE_SUPABASE_URL as string, anonKey.anonKey)

  const channel = client.channel('most-recent-broadcast')
  channel
    .on('broadcast', { event: 'details' }, (message: RealtimeMessage) => setMostRecentBroadcastDetails(message.payload))
    .subscribe()

  return mostRecentBroadcastDetails
}

export default useSubscribeMostRecentBroadcastDetail
