import { type FC, useEffect, useState } from 'react'
import DateUtils from '../../utils/date'
import type { BroadcastSentDetail, PastBroadcast } from '../../apis/broadcastApi'
import useSubscribeMostRecentBroadcastDetail from '../../hooks/supabase'

interface LastBroadcastStatusProps {
  latestBroadcast?: PastBroadcast
}

const LastBroadcastStatus: FC<LastBroadcastStatusProps> = ({ latestBroadcast }) => {
  const [renderMostRecentBroadcastDetails, setRenderMostRecentBroadcastDetails] = useState<BroadcastSentDetail>({
    totalFirstSent: 0,
    totalSecondSent: 0,
    successfullyDelivered: 0,
    failedDelivered: 0,
    totalUnsubscribed: 0
  })
  const mostRecentBroadcastDetails = useSubscribeMostRecentBroadcastDetail() // may have one or all fields as undefined/no data

  useEffect(() => {
    if (mostRecentBroadcastDetails) {
      const newMostRecent = {
        totalFirstSent: mostRecentBroadcastDetails.totalFirstSent || renderMostRecentBroadcastDetails.totalFirstSent,
        totalSecondSent: mostRecentBroadcastDetails.totalSecondSent || renderMostRecentBroadcastDetails.totalSecondSent,
        successfullyDelivered:
          mostRecentBroadcastDetails.successfullyDelivered || renderMostRecentBroadcastDetails.successfullyDelivered,
        failedDelivered: mostRecentBroadcastDetails.failedDelivered || renderMostRecentBroadcastDetails.failedDelivered,
        totalUnsubscribed: renderMostRecentBroadcastDetails.totalUnsubscribed
      }

      setRenderMostRecentBroadcastDetails(newMostRecent)
    }
  }, [mostRecentBroadcastDetails])

  useEffect(() => {
    setRenderMostRecentBroadcastDetails({
      totalFirstSent: latestBroadcast?.totalFirstSent ?? 0,
      totalSecondSent: latestBroadcast?.totalSecondSent ?? 0,
      successfullyDelivered: latestBroadcast?.successfullyDelivered ?? 0,
      failedDelivered: latestBroadcast?.failedDelivered ?? 0,
      totalUnsubscribed: latestBroadcast?.totalUnsubscribed ?? 0
    })
  }, [latestBroadcast])

  return (
    <div className='mt-1.5' data-cy='most-recent'>
      <h2 className='font-bold'>
        Last batch sent{' '}
        <span className='font-normal italic'>{latestBroadcast ? DateUtils.format(latestBroadcast.runAt) : 'None'}</span>
      </h2>
      <ul className='pt-5'>
        <li>Conversation starters sent: {renderMostRecentBroadcastDetails.totalFirstSent}</li>
        <li>Follow-up messages sent: {renderMostRecentBroadcastDetails.totalSecondSent}</li>
        <li>Total delivered successfully: {renderMostRecentBroadcastDetails.successfullyDelivered}</li>
        <li>Failed to deliver: {renderMostRecentBroadcastDetails.failedDelivered}</li>
        <li>Unsubscribes: {renderMostRecentBroadcastDetails.totalUnsubscribed}</li>
      </ul>
    </div>
  )
}

LastBroadcastStatus.defaultProps = {
  latestBroadcast: undefined
}
export default LastBroadcastStatus
