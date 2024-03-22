import { useState } from 'react'
import DateUtils from 'utils/date'
import { useBroadcastDashboardQuery, useUpdateBroadcast } from 'hooks/broadcast'
import PastBroadcasts from './PastBroadcasts'
import RunAtPicker from './RunAtPicker'
import { useQueryClient } from '@tanstack/react-query'
import LastBroadcastStatus from './LastBroadcastStatus'
import { sendNowBroadcast } from '../../apis/broadcastApi'
import EditIcon from '../../assets/edit-icon.svg?react'
import { AxiosError } from 'axios'
import getErrorMessage from '../../utils/sendNowFeedback'

const BroadcastDashboard = () => {
  const queryClient = useQueryClient()
  const { data, isPending } = useBroadcastDashboardQuery(queryClient)
  const [isRunAtPickerOpen, setIsRunAtPickerOpen] = useState(false)
  const [isSent, setIsSent] = useState<boolean>(false)

  const { mutate } = useUpdateBroadcast(queryClient)

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }

  const { upcoming } = data.data

  const globalSendNowConfirm = async () => {
    const note = `Conversation starters will be sent to ${upcoming.noRecipients} recipients. `
    const sendBtnText = 'Send now'
    const title = 'Send now'

    const e = [
      {
        type: 'title',
        data: {
          subtitle: [note]
        }
      },
      {
        type: 'input',
        data: {
          type: 'hidden',
          name: title,
          value: true,
          required: true
        }
      }
    ]

    const result = await Missive.openForm({
      name: title,
      fields: e,
      buttons: [
        {
          type: 'cancel',
          label: 'Cancel'
        },
        {
          type: 'submit',
          label: sendBtnText
        }
      ]
    })

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (result[title]) {
      setIsSent(true)
      try {
        await sendNowBroadcast()
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (err.response?.data && err.response.data.message !== undefined) {
            const errorCode = err.response.data.message
            const errorMessage = getErrorMessage(errorCode)
            await Missive.alert({
              title: 'Error while sending broadcast',
              message: errorMessage,
              note: ''
            })
          }
        } else {
          /* empty */
        }
      } finally {
        setIsSent(false)
        await queryClient.invalidateQueries({ queryKey: ['broadcastDashboard'] })
      }
    }
  }

  const globalEditMessageForm = async (isFirst: boolean) => {
    let warning = ''
    let note = ''
    let saveBtnText = 'Save changes'
    if (DateUtils.diffInMinutes(upcoming.runAt) < 90) {
      saveBtnText = 'Save changes and \n delay the next batch'
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

    const result = await Missive.openForm({
      name: title,
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
      ],
      options: {
        autoClose: false
      }
    })

    const messageToUpdate = isFirst ? upcoming.firstMessage : upcoming.secondMessage

    if (result[title] !== messageToUpdate) {
      const updated = isFirst ? { firstMessage: result[title] } : { secondMessage: result[title] }
      mutate({ id: upcoming.id, ...updated })
    } else {
      await Missive.closeForm()
    }
  }

  return (
    <div className='container mx-auto mt-4 w-[22rem] max-w-md'>
      <h2 className='mt-3 text-lg'>Next batch</h2>
      <h3 className='mt-2'>
        Scheduled for <span className='font-medium'>{DateUtils.format(upcoming.runAt)}</span>
      </h3>
      <div className='mt-3 flex justify-center'>
        <span className='button mr-4 block bg-missive-blue-color p-0'>
          <button
            type='button'
            className='button inline-block px-8 hover:!bg-rgba-missive-no-bg-color'
            disabled={isSent}
            onClick={() => setIsRunAtPickerOpen(true)}
          >
            Pause schedule
          </button>
        </span>
        <span className='button ml-4 block bg-missive-blue-color p-0'>
          <button
            type='button'
            className={`button button-async inline-block px-10 hover:!bg-rgba-missive-no-bg-color ${isSent ? 'button-async--loading' : ''}`}
            onClick={() => {
              void globalSendNowConfirm()
            }}
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

      <h3 className='mt-5 flex'>
        Conversation starter{' '}
        <button
          type='button'
          className='ml-2 bg-transparent p-0'
          data-cy='edit-first-message'
          onClick={() => void globalEditMessageForm(true)}
        >
          <img src={EditIcon} alt='Edit icon' />
        </button>
      </h3>

      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.firstMessage}</p>

      <h3 className='mt-4 flex'>
        Follow-up message{' '}
        <button type='button' className='ml-2 bg-transparent p-0' onClick={() => void globalEditMessageForm(false)}>
          <img src={EditIcon} alt='Edit icon' />
        </button>
      </h3>

      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.secondMessage}</p>

      <div
        className={`fixed left-0 top-0 h-full w-full ${isRunAtPickerOpen ? 'block bg-missive-background-color opacity-80' : 'hidden'}`}
      />
      <RunAtPicker
        isOpen={isRunAtPickerOpen}
        runAt={upcoming.runAt}
        broadcastId={upcoming.id}
        onClose={() => setIsRunAtPickerOpen(false)}
      />

      <hr className='mt-8 border-gray-500' />

      <LastBroadcastStatus latestBroadcast={data.data.past[0]} />

      <hr className='mt-8 border-gray-500' />

      <PastBroadcasts />
    </div>
  )
}

export default BroadcastDashboard
