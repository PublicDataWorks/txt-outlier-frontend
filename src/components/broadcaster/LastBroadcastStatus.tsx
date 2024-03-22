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
    <div className='mt-7' data-cy='most-recent'>
      <h2 className='text-lg'>Last batch</h2>
      <h3 className='mt-2 font-normal'>
        Sent on{' '}
        <span className='font-medium'>{latestBroadcast ? DateUtils.format(latestBroadcast.runAt) : 'None'}</span>
      </h3>

      <ul className='pt-3.5'>
        <li className='pt-3 font-medium'>
          {renderMostRecentBroadcastDetails.totalFirstSent}{' '}
          <span className='font-normal'>Conversation starters sent</span>
        </li>
        <li className='pt-3 font-medium'>
          {renderMostRecentBroadcastDetails.totalSecondSent}{' '}
          <span className='font-normal'>Follow-up messages sent</span>
        </li>
        <li className='pt-3 font-medium'>
          {renderMostRecentBroadcastDetails.successfullyDelivered}{' '}
          <span className='font-normal'>Delivered successfully</span>
        </li>
        <li className='pt-3 font-medium'>
          {renderMostRecentBroadcastDetails.failedDelivered} <span className='font-normal'>Failed to deliver</span>
        </li>
        <li className='pt-3 font-medium'>
          {renderMostRecentBroadcastDetails.totalUnsubscribed} <span className='font-normal'>Unsubscribes</span>
        </li>
      </ul>
    </div>
  )
}

LastBroadcastStatus.defaultProps = {
  latestBroadcast: undefined
}
export default LastBroadcastStatus
