import { useState } from 'react'
import BroadcastForm from './BroadcastForm'
import DateUtils from 'utils/date'
import Button from 'components/Button'
import { useBroadcastDashboardQuery, useUpdateBroadcast } from 'hooks/broadcast'
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
  const [isSent, setIsSent] = useState<boolean>(false)

  const { mutate } = useUpdateBroadcast(queryClient)

  const onEditClick = (isFirst: boolean) => {
    setIsPopupOpen(true)
    setIsFirstMessage(isFirst)
  }

  const handleSendNow = () => {
    setIsSent(true)
    const result = makeBroadcast()
    void result
      .catch(err => console.log(err))
      .then(value => console.log(value))
      .finally(() => setIsSent(false))
  }

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }

  const { upcoming } = data.data

  const globalForm = (isFirst: boolean) => {
    let warning = ''
    let note = ''
    let saveBtnText = 'Save changes'
    if (DateUtils.diffInMinutes(upcoming.runAt) < 90) {
      saveBtnText = 'Save changes and delay the next batch'
      warning = `The next batch is scheduled to send less than 90 minutes from now.
      Making these message updates will delay today's batch by 2-3 hours, sending at approximately ${DateUtils.advance(90)}
      instead of ${DateUtils.format(upcoming.runAt)}. These changes will also apply to all future batches.`
      if (!isFirst) {
        note = `Note: follow-up messages are sent after the conversation starter,
        only if the recipient does not reply to the starter message.`
      }
    } else {
      note = isFirst
        ? 'Note: these updates will apply to all future batches.'
        : `Note: these updates will apply to all future batches. Follow-up messages are sent
        after the conversation starter, only if the recipient does not reply to the starter message.`
    }
    const title = isFirst ? 'Edit conversation starter' : 'Edit follow-up message'

    const e = [
      {
        type: 'title',
        data: {
          subtitle: [warning, note]
        }
      },
      {
        type: 'input',
        data: {
          type: 'textarea',
          focus: true,
          name: title,
          value: isFirst ? upcoming.firstMessage : upcoming.secondMessage,
          required: true
        }
      }
    ]

    const result = Missive.openForm({
      name: 'Settings',
      fields: e,
      buttons: [
        {
          type: 'cancel',
          label: 'Cancel'
        },
        {
          type: 'submit',
          label: saveBtnText
        }
      ]
    })

    void result
      .then(value => {
        console.log(value)
        const messageToUpdate = isFirst ? upcoming.firstMessage : upcoming.secondMessage
        if (value[title] !== messageToUpdate) {
          console.log('update')
          const updated = isFirst ? { firstMessage: value[title] } : { secondMessage: value[title] }
          mutate({
            id: upcoming.id,
            ...updated
          })
        } else {
          console.log('do nothing')
          /* empty */
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <div className='container mx-auto mt-4 w-[22rem] max-w-md'>
      <h2 className='mt-3 font-bold'>
        Next batch scheduled <span className='font-normal italic'>{DateUtils.format(upcoming.runAt)}</span>
      </h2>
      <div className='mt-3 flex justify-center'>
        <span className='button mr-2 bg-missive-blue-color p-0'>
          <button
            type='button'
            className='button py-3 hover:!bg-rgba-missive-no-bg-color'
            onClick={() => setIsRunAtPickerOpen(true)}
          >
            Pause schedule
          </button>
        </span>
        <span className='button ml-2 bg-missive-blue-color p-0'>
          <button
            type='button'
            className={`button button-async py-3 hover:!bg-rgba-missive-no-bg-color ${isSent ? 'button-async--loading' : ''}`}
            onClick={handleSendNow}
          >
            <span>
              <span className='button-async-label'>Send now</span>
            </span>
            <div className='loading-icon '>
              <i className='icon icon-circle h-6 w-6'>
                <svg className='h-6 w-6'>
                  <use xlinkHref='#circle' />
                </svg>
              </i>
            </div>
          </button>
        </span>
      </div>

      <Button
        text='dasdasdasdasdasd'
        className='button mt-px bg-missive-background-color py-1 text-missive-blue-color hover:!bg-rgba-missive-blue-color'
        data-cy='edit-first-message'
        onClick={() => globalForm(false)}
      />

      <h3 className='mt-5 font-bold'>Conversation starter</h3>
      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.firstMessage}</p>
      <Button
        text='edit'
        className='button mt-px bg-missive-background-color py-1 text-missive-blue-color hover:!bg-rgba-missive-blue-color'
        data-cy='edit-first-message'
        onClick={() => globalForm(true)}
      />

      <h3 className='mt-5 font-bold'>Follow-up message</h3>
      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.secondMessage}</p>
      <Button
        text='edit'
        className='data-edit-second-message button mt-px bg-missive-background-color py-1  text-missive-blue-color hover:!bg-rgba-missive-blue-color'
        onClick={() => globalForm(false)}
      />
      <div
        className={`fixed left-0 top-0 h-full w-full ${isPopupOpen || isRunAtPickerOpen ? 'block bg-missive-background-color opacity-80' : 'hidden'}`}
      />
      <RunAtPicker
        isOpen={isRunAtPickerOpen}
        runAt={upcoming.runAt}
        broadcastId={upcoming.id}
        onClose={() => setIsRunAtPickerOpen(false)}
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
