import { useState } from 'react'
import BroadcastForm from './BroadcastForm'
import DateUtils from 'utils/date'
import Button from 'components/Button'
import { useBroadcastDashboardQuery } from 'hooks/broadcast'
import PastBroadcasts from './PastBroadcasts'
import RunAtPicker from './RunAtPicker'
import { useQueryClient } from '@tanstack/react-query'
import LastBroadcastStatus from './LastBroadcastStatus'
import { makeBroadcast } from '../../apis/broadcastApi'

const BroadcastDashboard = () => {
  const queryClient = useQueryClient()
  const { data, isPending } = useBroadcastDashboardQuery(queryClient)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isRunAtPickerOpen, setIsRunAtPickerOpen] = useState(false)
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true)

  const onEditClick = (isFirst: boolean) => {
    setIsPopupOpen(true)
    setIsFirstMessage(isFirst)
  }

  const handleSendNow = () => {
    void makeBroadcast()
  }

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }

  const { upcoming } = data.data
  return (
    <div className='container mx-auto mt-4 w-[22rem] max-w-md'>
      <h2 className='mt-3 font-bold'>
        Next batch scheduled <span className='font-normal italic'>{DateUtils.format(upcoming.runAt)}</span>
      </h2>
      <div className='mt-3 flex justify-center'>
        <button
          type='button'
          className='button mr-2 border-missive-text-color-a bg-missive-background-color py-3 hover:bg-rgba-missive-text-color-a'
          onClick={() => setIsRunAtPickerOpen(true)}
        >
          Pause schedule
        </button>
        <button
          type='button'
          className='button ml-2 border-missive-text-color-a bg-missive-background-color py-3 hover:bg-rgba-missive-text-color-a'
          onClick={handleSendNow}
        >
          Send now
        </button>
      </div>

      <h3 className='mt-5 font-bold'>Conversation starter</h3>
      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.firstMessage}</p>
      <Button
        text='edit'
        className='button mt-px bg-missive-background-color py-2 text-missive-blue-color'
        data-cy='edit-first-message'
        onClick={() => onEditClick(true)}
      />

      <h3 className='mt-5 font-bold'>Follow-up message</h3>
      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.secondMessage}</p>
      <Button
        text='edit'
        className='data-edit-second-message button mt-px bg-missive-background-color py-2 text-missive-blue-color'
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
      <hr className='mt-3 border-gray-500' />

      <LastBroadcastStatus latestBroadcast={data.data.past[0]} />

      <hr className='mt-2 border-gray-500' />

      <PastBroadcasts />
    </div>
  )
}

export default BroadcastDashboard
