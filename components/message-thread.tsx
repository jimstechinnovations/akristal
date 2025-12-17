'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeTime, getErrorMessage } from '@/lib/utils'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

type MessageInsert = Database['public']['Tables']['messages']['Insert']

interface MessageThreadProps {
  conversation: Database['public']['Tables']['conversations']['Row'] & {
    properties: Pick<Database['public']['Tables']['properties']['Row'], 'title' | 'id'> | null
  }
  messages: Array<
    Database['public']['Tables']['messages']['Row'] & {
      profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'> | null
    }
  >
  currentUserId: string
}

export function MessageThread({
  conversation,
  messages: initialMessages,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageThreadProps['messages']>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload: RealtimePostgresInsertPayload<Database['public']['Tables']['messages']['Row']>) => {
          // Fetch the new message with profile data
          supabase
            .from('messages')
            .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMessages((prev) => [...prev, data as MessageThreadProps['messages'][number]])
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)

    try {
      const messageInsert: MessageInsert = {
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
      }

      const { data, error } = await (supabase as any)
        .from('messages')
        .insert(messageInsert)
        .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data as MessageThreadProps['messages'][number]])
      setNewMessage('')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          {conversation.properties?.title || 'Conversation'}
        </h1>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    }`}
                  >
                    {!isOwn && (
                      <div className="mb-1 text-xs font-semibold">
                        {message.profiles?.full_name || 'User'}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    <div
                      className={`mt-1 text-xs ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatRelativeTime(message.created_at)}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


