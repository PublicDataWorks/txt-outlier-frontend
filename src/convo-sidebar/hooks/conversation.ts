import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../lib/axios'
import { CONTACT_PATH, CONVERSATION_SUMMARY_PATH } from '../constants/routes'
import type { AxiosResponse } from 'axios'

interface ConversationSummary {
  assignee_user_name: string[]
  author_email: string
  author_zipcode: string
  first_reply: number
  last_reply: number
  labels: string[]
  keyword_label_parent_id: string
  impact_label_parent_id: string
  messages: string
  messages_title?: string
  outcome: string
  outcome_title?: string
  comments: string
  comments_title?: string
}

interface ContactUpdatePayload {
  zipcode?: string
  email?: string
}

interface MutationProps {
  phone: string
  zipcode?: string
  email?: string
}

const useConversationSummaryQuery = (conversationId: string, reference: string, onSuccess: () => void) =>
  useQuery({
    queryKey: ['conversationSummary', conversationId, reference],
    queryFn: async (): Promise<ConversationSummary> => {
      const res: AxiosResponse<ConversationSummary> =
        await axios.get(`${CONVERSATION_SUMMARY_PATH}/${conversationId}?reference=${encodeURIComponent(reference)}`)
      onSuccess()
      return res.data
    },
    enabled: !!conversationId && !!reference,
    refetchInterval: 1000 * 30
  })

const useUpdateConversationSummary = () =>
  useMutation({
    mutationFn: async ({ phone, zipcode, email }: MutationProps) => {
      const updatedData = {} as ContactUpdatePayload
      // Allow empty to clear the field
      if (zipcode !== undefined) updatedData.zipcode = zipcode
      if (email !== undefined) updatedData.email = email
      return axios.patch(`${CONTACT_PATH}/${encodeURIComponent(phone)}`, updatedData)
    }
  })

export { useConversationSummaryQuery, useUpdateConversationSummary }
export type { ConversationSummary }

