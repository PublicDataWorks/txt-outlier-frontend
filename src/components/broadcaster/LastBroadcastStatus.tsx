import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useBroadcastDashboardQuery, usePastBroadcastsQuery } from '../../hooks/broadcast'
import DateUtils from '../../utils/date'
import type { BroadcastSentDetail } from '../../apis/broadcastApi'
import useSubscribeMostRecentBroadcastDetail from '../../hooks/supabase'

const LastBroadcastStatus = () => {
  const queryClient = useQueryClient()
  const initialData = {
    pages: [queryClient.getQueryData(['broadcastDashboard'])],
    pageParams: [0]
  }
  const { data, isPending } = useBroadcastDashboardQuery(queryClient)

  const [renderMostRecentBroadcastDetails, setRenderMostRecentBroadcastDetails] = useState<BroadcastSentDetail>({
    failedDelivered: 0,
    successfullyDelivered: 0,
    totalFirstSent: 0,
    totalSecondSent: 0
  })
  const mostRecentBroadcastDetails = useSubscribeMostRecentBroadcastDetail() // may has one or all fields as undefined/no data
  const { data: pastData } = usePastBroadcastsQuery(initialData)

  useEffect(() => {
    if (!isPending && data?.data && data.data.past.length > 0) {
      const newMostRecent = {
        totalFirstSent: data.data.past[0]?.totalFirstSent,
        totalSecondSent: data.data.past[0]?.totalSecondSent,
        successfullyDelivered: data.data.past[0]?.successfullyDelivered,
        failedDelivered: data.data.past[0]?.failedDelivered
      }
      setRenderMostRecentBroadcastDetails({
        totalFirstSent: newMostRecent.totalFirstSent ?? 0,
        totalSecondSent: newMostRecent.totalSecondSent ?? 0,
        successfullyDelivered: newMostRecent.successfullyDelivered ?? 0,
        failedDelivered: newMostRecent.failedDelivered ?? 0
      })
    }
  }, [isPending])

  useEffect(() => {
    if (mostRecentBroadcastDetails !== undefined) {
      const newMostRecent = {
        totalFirstSent: mostRecentBroadcastDetails.totalFirstSent || renderMostRecentBroadcastDetails.totalFirstSent,
        totalSecondSent: mostRecentBroadcastDetails.totalSecondSent || renderMostRecentBroadcastDetails.totalSecondSent,
        successfullyDelivered:
          mostRecentBroadcastDetails.successfullyDelivered || renderMostRecentBroadcastDetails.successfullyDelivered,
        failedDelivered: mostRecentBroadcastDetails.failedDelivered || renderMostRecentBroadcastDetails.failedDelivered
      }
      setRenderMostRecentBroadcastDetails(newMostRecent)
    }
  }, [mostRecentBroadcastDetails])

  return (
    <div className='mt-1.5'>
      <h2 className='font-bold' data-cy='most-recent'>
        Last batch sent{' '}
        <span className='font-normal italic'>
          {pastData?.pages[0]?.data.past[0] ? DateUtils.format(pastData.pages[0].data.past[0].runAt) : 'None'}
        </span>
      </h2>
      <ul className='pt-5'>
        <li>Conversation starters sent: {renderMostRecentBroadcastDetails.totalFirstSent}</li>
        <li>Follow-up messages sent: {renderMostRecentBroadcastDetails.totalSecondSent}</li>
        <li>Total delivered successfully: {renderMostRecentBroadcastDetails.successfullyDelivered}</li>
        <li>Failed to deliver: {renderMostRecentBroadcastDetails.failedDelivered}</li>
        <li>Unsubscribes: {renderMostRecentBroadcastDetails.failedDelivered}</li>
      </ul>
    </div>
  )
}

export default LastBroadcastStatus
