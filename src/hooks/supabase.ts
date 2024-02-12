import { createClient } from '@supabase/supabase-js'
import { BroadcastSentDetail } from 'apis/broadcastApi'
import { useState } from 'react'

interface RealtimeMessage {
  event: string
  type: string
  payload: BroadcastSentDetail
}
const client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const useSubscribeMostRecentBroadcastDetail = (): BroadcastSentDetail | undefined => {
  const [mostRecentBroadcastDetails, setMostRecentBroadcastDetails] = useState<BroadcastSentDetail | undefined>()

  const channel = client.channel('most-recent-broadcast')
  channel
    .on('broadcast', { event: 'details' }, (message: RealtimeMessage) => setMostRecentBroadcastDetails(message.payload))
    .subscribe()

  return mostRecentBroadcastDetails
}

export { useSubscribeMostRecentBroadcastDetail }
