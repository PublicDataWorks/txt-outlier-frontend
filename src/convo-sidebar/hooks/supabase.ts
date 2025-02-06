import { useAnonKey } from '../providers/key'
import { useEffect, useRef, useState } from 'react'
import type { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

interface AuthorUpdatePayload {
  zipcode: string
  email: string
}

interface CommentInsertPayload {
  conversation_id: string
  to_field: string
}

const useAuthorChanges = (convoId: string, toField: string) => {
  const { anonKey } = useAnonKey()
  const [email, setEmail] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [newMessage, setNewMessage] = useState(false)
  const convoIdRef = useRef({ convoId, toField })

  useEffect(() => {
    convoIdRef.current = { convoId, toField }
  }, [convoId, toField])

  useEffect(() => {
    if (anonKey) {
      const client = createClient(import.meta.env.VITE_SUPABASE_URL as string, anonKey)
      client
        .channel('author-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'authors'
          },
          (payload: RealtimePostgresUpdatePayload<AuthorUpdatePayload>) => {
            if (payload.new.zipcode !== zipcode)
              setZipcode(payload.new.zipcode)
            if (payload.new.email !== email)
              setEmail(payload.new.email)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments'
          },
          (payload: RealtimePostgresInsertPayload<CommentInsertPayload>) => {
            if (payload.new.conversation_id === convoIdRef.current.convoId)
              setNewMessage(true)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'twilio_messages'
          },
          (payload: RealtimePostgresInsertPayload<CommentInsertPayload>) => {
            if (payload.new.to_field === convoIdRef.current.toField)
              setNewMessage(true)
          }
        )
        .subscribe()
      return () => void client.removeAllChannels()
    }
    return () => {
    }
  }, [anonKey])

  return { email, setEmail, zipcode, setZipcode, newMessage, setNewMessage }
}
export default useAuthorChanges
