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
  const [isSent, setIsSent] = useState<boolean>(false)

  const onEditClick = (isFirst: boolean) => {
    setIsPopupOpen(true)
    setIsFirstMessage(isFirst)
  }

  // const editFirst = [{
  //   type: "input",
  //   data: {
  //     subtitle: ["The OpenAI API is powered by a diverse set of models with different capabilities and price points. The default model will be used for all prompts unless you specify a different model in the prompt itself."]
  //   }
  // }]
  //
  //
  // const editSecond = [{
  //   type: "input",
  //   data: {
  //     type: "text",
  //     focus: true,
  //     name: "dadasd",
  //     value: "dasdasd",
  //     required: true
  //   },
  //   subtitle: ["The OpenAI API is powered by a diverse set of models with different capabilities and price points. The default model will be used for all prompts unless you specify a different model in the prompt itself."]
  //
  // }]


  const e = [{
    type: "input",
    data: {
      subtitle: ["The OpenAI API is powered by a diverse set of models with different capabilities and price points. The default model will be used for all prompts unless you specify a different model in the prompt itself."]
    }
  }]

  const globalForm = async () => {
    const result = await Missive.openForm({
      name: "Settings",
      fields: e,
      buttons: [{
        type: "cancel",
        label: "Cancel"
      }, {
        type: "submit",
        label: "Update"
      }]
    });
    console.log(result)
  }

  const handleSendNow = async () => {
    setIsSent(true)
    await makeBroadcast();
    setIsSent(false);
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
        <span className='mr-2 button p-0 bg-missive-blue-color'>
          <button
            type='button'
            className='button py-3 hover:!bg-rgba-missive-no-bg-color'
            onClick={() => setIsRunAtPickerOpen(true)}
          >
            Pause schedule
          </button>
        </span>
        <span className='ml-2 button p-0 bg-missive-blue-color'>
          <button type='button' className={`button button-async py-3 hover:!bg-rgba-missive-no-bg-color ${isSent ? 'button-async--loading' : ''}`} onClick={ () => handleSendNow }>
              <span>
                <span className="button-async-label">Send now</span>
              </span>
            <div className="loading-icon ">
              <i className="icon icon-circle w-6 h-6">
                <svg className="w-6 h-6">
                  <use xlinkHref="#circle" />
                </svg>
              </i>
            </div>
          </button>
        </span>
      </div>

      <Button
        text='dasdasdasdasdasd'
        className='button mt-px bg-missive-background-color hover:!bg-rgba-missive-blue-color py-1 text-missive-blue-color'
        data-cy='edit-first-message'
        onClick={ ()=> globalForm }
      />

      <h3 className='mt-5 font-bold'>Conversation starter</h3>
      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.firstMessage}</p>
      <Button
        text='edit'
        className='button mt-px bg-missive-background-color hover:!bg-rgba-missive-blue-color py-1 text-missive-blue-color'
        data-cy='edit-first-message'
        onClick={() => onEditClick(true)}
      />

      <h3 className='mt-5 font-bold'>Follow-up message</h3>
      <p className='mt-3 bg-missive-light-border-color px-3 py-4 italic'>{upcoming.secondMessage}</p>
      <Button
        text='edit'
        className='data-edit-second-message button bg-missive-background-color hover:!bg-rgba-missive-blue-color mt-px  py-1 text-missive-blue-color'
        onClick={() => onEditClick(false)}
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
