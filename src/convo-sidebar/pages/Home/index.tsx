import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { formatUnixTimestamp } from '../../helpers/date'
import { useConversationSummaryQuery, useUpdateConversationSummary } from '../../hooks/conversation'
import Spinner from '../../components/Spinner'
import type { AxiosError, AxiosResponse } from 'axios'
import { EMAIL_REGEX } from '../../helpers/string'
import useAuthorChanges from '../../hooks/supabase'

interface ContactInfo {
  name: string
  phoneNumber: string
}

interface QueryParams {
  conversationId: string
  reference: string
}

interface UpdatePayload {
  newEmail?: string
  newZipcode?: string
}

interface ApiResponse extends AxiosResponse {
  data: {
    type: string
    msg: string
  }
}

interface ApiResponseError extends AxiosError {
  response?: ApiResponse
}

function Home() {
  // Available data from the SDK
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phoneNumber: ''
  })
  const [queryParams, setQueryParams] = useState<QueryParams>({
    conversationId: '',
    reference: ''
  })
  const [keywordLabels, setKeywordLabels] = useState<string[]>([])
  const [impactLabels, setImpactLabels] = useState<string[]>([])
  // errorMsg === undefined means no error, empty string means an error without message
  const [errorMsg, setErrorMsg] = useState<string | undefined>('Please select another SMS conversation to activate the conversation summary sidebar')
  const { mutate, isError, error: updateError } = useUpdateConversationSummary()
  const {
    email,
    setEmail,
    zipcode,
    setZipcode,
    newMessage,
    setNewMessage
  } = useAuthorChanges(queryParams.conversationId, queryParams.reference)

  const debouncedUpdate = useCallback(debounce(({ newEmail, newZipcode }: UpdatePayload) => {
    if (contactInfo.phoneNumber) {
      mutate({ phone: contactInfo.phoneNumber, email: newEmail, zipcode: newZipcode })
    }
  }, 1000), [contactInfo])

  const handleEmailInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (EMAIL_REGEX.test(event.target.value) || event.target.value === '') {
      debouncedUpdate({ newEmail: event.target.value })
    }
  }
  const handleQuerySuccess = useCallback(() => {
    setNewMessage(false)
  }, [])

  const {
    data,
    isPending,
    error
  } = useConversationSummaryQuery(queryParams.conversationId, queryParams.reference, handleQuerySuccess)

  const handleZipcodeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setZipcode(event.target.value)
    debouncedUpdate({ newZipcode: event.target.value })
  }

  const handleConversationChange = useCallback((ids: string[]) => {
    console.log('----- Missive on change', ids)
    Missive.fetchConversations(ids)
      .then(conversations => {
        console.log('---- convo: ', conversations)
        if (conversations.length !== 1) {
          // Select multiple tabs, that means user is not reading the conversation
          return
        }
        const info: ContactInfo = { name: '', phoneNumber: '' }
        console.log('---- info: ', info)
        const params: QueryParams = { conversationId: '', reference: '' }
        // TS thinks it's a Conversation | undefined if we don't cast
        const convo: Conversation = conversations[0] as Conversation
        const contact = convo.authors.find(phone => phone.phone_number && phone.phone_number !== import.meta.env.VITE_OUTLIER_PHONE_NUMBER)
        if (contact) {
          info.name = contact.name
          info.phoneNumber = contact.phone_number
          params.conversationId = convo.id
          params.reference = contact.phone_number
          setErrorMsg(undefined)
        } else {
          setErrorMsg('')
        }
        setContactInfo(info)
        setQueryParams(params)
        setNewMessage(false)
      })
      // eslint-disable-next-line no-console
      .catch(e => {
        console.log('==== e: ', e)
      })
  }, [])

  useEffect(() => {
    Missive.on('change:conversations', handleConversationChange)
  }, [])

  useEffect(() => {
    if (data) {
      setEmail(data.author_email || '')
      setZipcode(data.author_zipcode || '')
      void Missive.fetchLabels().then(missivelabels => {
        const labelWithInfo = data.labels
          .map(labelId => missivelabels.find(label => label.id === labelId))
          .filter(label => label)

        const keywords = labelWithInfo
          .filter(label => label?.parent_id === data.keyword_label_parent_id)
          // @ts-expect-error TS doesn't recognize that filter ensures non-null values
          .map(label => label.name)
        const impacts = labelWithInfo
          .filter(label => label?.parent_id === data.impact_label_parent_id)
          // @ts-expect-error TS doesn't recognize that filter ensures non-null values
          .map(label => label.name)

        setKeywordLabels(keywords)
        setImpactLabels(impacts)
      })
    }
  }, [data])

  if (errorMsg !== undefined || error) {
    // empty string is considered as an error that doesn't carry message
    return <div>{error ? error.message : errorMsg}</div>
  }

  if (isPending) {
    return <Spinner />
  }
  const conversation = data
  return (
    <div className={`px-4 pt-2 ${newMessage ? 'cursor-progress' : ''}`}>
      <div className="text-xl font-bold">{contactInfo.name}</div>
      <div className="text-lg">{contactInfo.phoneNumber}</div>
      <div className="relative z-0">
        <input type="text" id="floating-email"
          className="block py-2.5 px-0 w-full text-lg bg-transparent appearance-none focus:outline-none focus:ring-0 peer focus:shadow-none text-missive-text-color-e cursor-text"
          onChange={handleEmailInputChange}
          value={email}
        />
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          htmlFor="floating-email"
          className={`pl-2 text-missive-text-color-e cursor-text peer-focus:text-missive-blue-color absolute text-lg duration-300 transform top-3 origin-[0] peer-focus:start-0 ${email
            ? 'scale-75 -translate-y-6 rtl:translate-x-1/4 rtl:left-auto'
            : 'scale-100 translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto'
            }`}
        >
          Email
        </label>
        {isError ?
          <div className="text-red-500">
            {(updateError as ApiResponseError).response?.data.type === 'email' ? (updateError as ApiResponseError).response?.data.msg : ''}
          </div> : null}
      </div>

      <div className="mt-2 rounded-xl bg-missive-light-border-color p-4">
        <div>
          First reply on <span className="font-bold">{formatUnixTimestamp(conversation.first_reply)}</span>
        </div>
        <div className="pt-2">
          Most recent reply on{' '}
          <span className="font-bold">
            {formatUnixTimestamp(conversation.last_reply)}
          </span>
        </div>
        <div className="pt-2 flex">
          <div>Zip code:</div>
          <div className="relative z-0 ml-1">
            <input type="text" id="floating-zipcode"
              className="block w-full p-0 text-sm appearance-none focus:outline-none focus:ring-0 peer focus:shadow-none text-missive-text-color-e cursor-text"
              onChange={handleZipcodeInputChange}
              value={zipcode} />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="floating-zipcode"
              className={`pl-1 text-missive-text-color-e cursor-text peer-focus:text-missive-blue-color absolute text-sm top-0 duration-300 transform origin-[0] peer-focus:start-0 ${zipcode
                ? 'scale-75 -translate-y-4 rtl:translate-x-1/4 rtl:left-auto'
                : 'scale-100 translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto'
                }`}
            >
              Zip code
            </label>
          </div>
        </div>
        {isError ?
          <div className="text-red-500">
            {(updateError as ApiResponseError).response?.data.type === 'zipcode' ? (updateError as ApiResponseError).response?.data.msg : ''}
          </div> : null}

        <div className="pt-2">
          Reporters contacted:{' '}
          <span className="font-bold">{conversation.assignee_user_name.join(', ')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywordLabels.map(tag => (
            <div key={tag} className="rounded-missive-border-radius bg-missive-text-color-d px-2 py-2 font-bold">
              {tag}
            </div>
          ))}
        </div>
      </div>
      {/* eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing */}
      <div className="mb-2 mt-4 font-bold">{conversation.comments_title || 'Reporter notes'}</div>
      <div className="rounded-xl bg-missive-light-border-color p-4 italic">{conversation.comments}</div>
      {/* eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing */}
      <div className="mb-2 mt-4 font-bold">{conversation.outcome_title || 'Impact and outcomes'}</div>
      <div className="rounded-xl bg-missive-light-border-color p-4">
        <div className="pb-2 italic">{conversation.outcome}</div>
        <div className="flex flex-wrap gap-2 pt-2">
          {impactLabels.map(tag => (
            <div key={tag} className="rounded-missive-border-radius bg-missive-text-color-d px-2 py-2 font-bold">
              {tag}
            </div>
          ))}
        </div>
      </div>
      {/* eslint-disable-next-line  @typescript-eslint/prefer-nullish-coalescing */}
      <div className="mb-2 mt-4 font-bold">{conversation.messages_title || 'Communication patterns'}</div>
      <div className="rounded-xl bg-missive-light-border-color p-4 italic">{conversation.messages}</div>
    </div>
  )
}

export default Home
