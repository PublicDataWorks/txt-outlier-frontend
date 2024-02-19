import { useState, useEffect } from 'react'
import BroadcastForm from './BroadcastForm'
import DateUtils from 'utils/date'
import Button from 'components/Button'
import { useBroadcastDashboardQuery } from 'hooks/broadcast'
import PastBroadcasts from './PastBroadcasts'
import RunAtPicker from './RunAtPicker'
import useSubscribeMostRecentBroadcastDetail from 'hooks/supabase'
import type { BroadcastSentDetail } from 'apis/broadcastApi'

const BroadcastDashboard = () => {
  const { data, isPending } = useBroadcastDashboardQuery()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isRunAtPickerOpen, setIsRunAtPickerOpen] = useState(false)
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true)
  const [renderMostRecentBroadcastDetails, setRenderMostRecentBroadcastDetails] = useState<BroadcastSentDetail>({
    totalFirstSent: 0,
    totalSecondSent: 0,
    successfullyDelivered: 0,
    failedDelivered: 0
  }) // default broadcast detail to be shown with fallback value in case mostRecentBroadcastDetails has no data
  const mostRecentBroadcastDetails = useSubscribeMostRecentBroadcastDetail() // may has one or all fields as undefined/no data

  useEffect(() => {
    if (!isPending && data?.data && data.data.past.length > 0) {
      const newMostRecent = {
        totalFirstSent: data.data.past[0].totalFirstSent,
        totalSecondSent: data.data.past[0].totalSecondSent,
        successfullyDelivered: data.data.past[0].successfullyDelivered,
        failedDelivered: data.data.past[0].failedDelivered
      }
      setRenderMostRecentBroadcastDetails(newMostRecent)
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

  const onEditClick = (isFirst: boolean) => {
    setIsPopupOpen(true)
    setIsFirstMessage(isFirst)
  }

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }

  // mostRecentBroadcastDetails take priority over the latest batch
  const [latestBatch] = data.data.past
  const { upcoming } = data.data

  return (
    <div className='container mx-auto mt-4 w-[22rem] max-w-md'>
      <h2 className='mt-3 font-bold'>
        Next batch scheduled to send on <span className='font-normal italic'>{DateUtils.format(upcoming.runAt)}</span>
      </h2>
      <button type='button' className='button bg-button-color mt-3' onClick={() => setIsRunAtPickerOpen(true)}>
        Pause batch schedule
      </button>
      <h3 className='mt-5 font-bold'>Conversation starter</h3>
      <p className='mt-3 bg-missive-background-color px-3 py-4 italic'>{upcoming.firstMessage}</p>
      <Button
        text='edit'
        className='mt-px bg-missive-background-color'
        data-cy='edit-first-message'
        onClick={() => onEditClick(true)}
      />

      <h3 className='mt-5 font-bold'>
        Follow-up message <span className='font-normal italic'>{`(sent ${upcoming.delay} later if no reply)`}</span>
      </h3>
      <p className='mt-3 bg-missive-background-color px-3 py-4 italic'>{upcoming.secondMessage}</p>
      <Button
        text='edit'
        className='data-edit-second-message mb-6 mt-px bg-missive-background-color'
        onClick={() => onEditClick(false)}
      />

      <RunAtPicker
        isOpen={isRunAtPickerOpen}
        runAt={upcoming.runAt}
        broadcastId={upcoming.id}
        onClose={() => setIsRunAtPickerOpen(false)}
      />
      <div
        className={`fixed left-0 top-0 h-full w-full ${isPopupOpen ? 'block bg-missive-background-color opacity-80' : 'hidden'}`}
      />
      <BroadcastForm
        broadcast={upcoming}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        isFirstMessage={isFirstMessage}
      />
      <hr className='border-gray-500' />

      <div className='mt-2 rounded-md'>
        <h2 className='font-bold' data-cy='most-recent'>
          Most recent batch sent on {latestBatch?.runAt ? DateUtils.format(latestBatch.runAt) : 'None'}
        </h2>
        <ul className='pt-5'>
          <li>Total conversation starters sent: {renderMostRecentBroadcastDetails.totalFirstSent}</li>
          <li>Follow-up messages sent: {renderMostRecentBroadcastDetails.totalSecondSent}</li>
          <li>Delivered successfully: {renderMostRecentBroadcastDetails.successfullyDelivered}</li>
          <li>Failed to deliver: {renderMostRecentBroadcastDetails.failedDelivered}</li>
        </ul>
      </div>

      <hr className='mt-2 border-gray-500' />

      <PastBroadcasts />
    </div>
  )
}

export default BroadcastDashboard
