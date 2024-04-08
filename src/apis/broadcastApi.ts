import axios from 'lib/axios'
import type { AxiosResponse } from 'axios'
import { BROADCAST_PATH } from '../constants/routes'

interface BroadcastDashboard {
  upcoming: UpcomingBroadcast
  past: PastBroadcast[]
  currentCursor: number
}

interface UpcomingBroadcast {
  id: number
  firstMessage: string
  secondMessage: string
  runAt: number
  delay: string
  noRecipients: number
}

interface BroadcastSentDetail {
  totalFirstSent: number
  totalSecondSent: number
  successfullyDelivered: number
  failedDelivered: number
  totalUnsubscribed: number
}

interface PastBroadcast extends BroadcastSentDetail {
  id: number
  firstMessage: string
  secondMessage: string
  runAt: number
}

interface UpdateBroadcast {
  id: number
  firstMessage?: string
  secondMessage?: string
  runAt?: number
}

interface Params {
  pageParam?: number
}
const ITEMS_PER_PAGE = 5

const getPastBroadcasts = async ({ pageParam }: Params): Promise<AxiosResponse<BroadcastDashboard>> => {
  const cursor = pageParam ? `&cursor=${pageParam}` : ''
  return axios.get(`${BROADCAST_PATH}?limit=${ITEMS_PER_PAGE}${cursor}`)
}

const sendNowBroadcast = async (): Promise<void> => axios.get(`${BROADCAST_PATH}/send-now`)

const getBroadcastDashboard = async (): Promise<AxiosResponse<BroadcastDashboard>> => axios.get(BROADCAST_PATH)

const updateBroadcast = async ({
  id,
  firstMessage,
  secondMessage,
  runAt
}: UpdateBroadcast): Promise<AxiosResponse<UpcomingBroadcast>> =>
  axios.patch(`${BROADCAST_PATH}/${id}`, {
    firstMessage,
    secondMessage,
    runAt
  })

export { sendNowBroadcast, getBroadcastDashboard, updateBroadcast, getPastBroadcasts, ITEMS_PER_PAGE }
export type { UpdateBroadcast, UpcomingBroadcast, PastBroadcast, BroadcastDashboard, BroadcastSentDetail }
