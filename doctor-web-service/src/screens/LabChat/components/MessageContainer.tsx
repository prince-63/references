import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Spinner from 'components/spinner/Spinner'
import {MessageSquareText} from 'lucide-react'
import {LabChatMessage, LabChatThread} from '../types'
import {MessageBubble} from './MessageBubble'

interface MessageContainerProps {
  selectedThread: LabChatThread
  onLoadOlderMessages?: () => void
  hasMoreMessages?: boolean
  isLoadingMoreMessages?: boolean
  typingUsers?: string[]
  onMarkMessagesRead?: (messageIds: string[]) => void
  compact?: boolean
  isMessagesLoading?: boolean
}

const getMessageDate = (message: LabChatMessage) => {
  if (message.createdAt) {
    const parsed = new Date(message.createdAt)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const parsedFromTimestamp = new Date(message.timestamp)
  if (!Number.isNaN(parsedFromTimestamp.getTime())) return parsedFromTimestamp

  return null
}

const getDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateLabel = (date: Date) => {
  const today = new Date()
  const todayKey = getDateKey(today)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = getDateKey(yesterday)
  const messageDayKey = getDateKey(date)

  if (messageDayKey === todayKey) return 'Today'
  if (messageDayKey === yesterdayKey) return 'Yesterday'

  return date.toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})
}

export const MessageContainer = ({
  selectedThread,
  onLoadOlderMessages,
  hasMoreMessages = false,
  isLoadingMoreMessages = false,
  typingUsers = [],
  onMarkMessagesRead,
  compact = false,
  isMessagesLoading = false,
}: MessageContainerProps) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const previousMessageCountRef = useRef(0)
  const shouldStickToBottomRef = useRef(true)
  const isPrependingMessagesRef = useRef(false)
  const prependScrollHeightRef = useRef(0)
  const prependScrollTopRef = useRef(0)
  const wasMessagesLoadingRef = useRef(isMessagesLoading)
  const autoLoadBatchesRef = useRef(0)
  const [showUnreadPill, setShowUnreadPill] = useState(false)

  const messageItems = useMemo(() => {
    let previousDateKey = ''
    return selectedThread.messages.flatMap((message) => {
      const messageDate = getMessageDate(message)
      const dateKey = messageDate ? getDateKey(messageDate) : 'undated'
      const nextItems: Array<
        | {kind: 'date'; key: string; label: string}
        | {kind: 'message'; key: string; message: LabChatMessage}
      > = []

      if (dateKey !== previousDateKey) {
        nextItems.push({
          kind: 'date',
          key: `date-${dateKey}`,
          label: messageDate ? getDateLabel(messageDate) : 'Messages',
        })
        previousDateKey = dateKey
      }

      nextItems.push({
        kind: 'message',
        key: `message-${message.id}`,
        message,
      })

      return nextItems
    })
  }, [selectedThread.messages])

  const hasNoMessages = messageItems.length === 0

  const markUnreadMessagesAsRead = useCallback(() => {
    if (!onMarkMessagesRead || selectedThread.unreadCount === 0) return
    const unreadMessageIds = selectedThread.messages
      .filter((message) => !message.isOwnMessage)
      .map((message) => message.id)

    if (unreadMessageIds.length > 0) {
      onMarkMessagesRead(unreadMessageIds)
    }
  }, [onMarkMessagesRead, selectedThread.messages, selectedThread.unreadCount])

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    const remainingDistanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    const isNearBottom = remainingDistanceFromBottom < 140
    shouldStickToBottomRef.current = isNearBottom

    if (selectedThread.unreadCount) {
      setShowUnreadPill(!isNearBottom)
      if (isNearBottom) {
        markUnreadMessagesAsRead()
      }
    } else {
      setShowUnreadPill(false)
    }

    if (!onLoadOlderMessages) return
    if (!hasMoreMessages || isLoadingMoreMessages) return
    if (isPrependingMessagesRef.current) return
    if (container.scrollTop > 120) return

    isPrependingMessagesRef.current = true
    prependScrollHeightRef.current = container.scrollHeight
    prependScrollTopRef.current = container.scrollTop
    onLoadOlderMessages()
  }

  useEffect(() => {
    if (!messagesContainerRef.current) return
    previousMessageCountRef.current = selectedThread.messages.length
    shouldStickToBottomRef.current = true
    isPrependingMessagesRef.current = false
    autoLoadBatchesRef.current = 0

    requestAnimationFrame(() => {
      if (!messagesContainerRef.current) return
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setShowUnreadPill(false)
    })
  }, [selectedThread.id])

  useEffect(() => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    const nextCount = selectedThread.messages.length
    const previousCount = previousMessageCountRef.current

    if (isPrependingMessagesRef.current && nextCount > previousCount) {
      const heightDiff = container.scrollHeight - prependScrollHeightRef.current
      container.scrollTop = prependScrollTopRef.current + heightDiff
      isPrependingMessagesRef.current = false
      shouldStickToBottomRef.current = false
      previousMessageCountRef.current = nextCount
      return
    }

    if (nextCount > previousCount && shouldStickToBottomRef.current) {
      container.scrollTop = container.scrollHeight
    }

    previousMessageCountRef.current = nextCount
  }, [selectedThread.messages.length])

  useEffect(() => {
    if (isLoadingMoreMessages) return
    if (!isPrependingMessagesRef.current) return
    isPrependingMessagesRef.current = false
  }, [isLoadingMoreMessages])

  useEffect(() => {
    if (isMessagesLoading) return
    if (!onLoadOlderMessages) return
    if (!hasMoreMessages || isLoadingMoreMessages) return
    if (isPrependingMessagesRef.current) return

    const container = messagesContainerRef.current
    if (!container) return

    const canScroll = container.scrollHeight - container.clientHeight > 40
    if (canScroll) {
      autoLoadBatchesRef.current = 0
      return
    }
    if (autoLoadBatchesRef.current >= 6) return

    autoLoadBatchesRef.current += 1
    isPrependingMessagesRef.current = true
    prependScrollHeightRef.current = container.scrollHeight
    prependScrollTopRef.current = container.scrollTop
    onLoadOlderMessages()
  }, [
    hasMoreMessages,
    isLoadingMoreMessages,
    isMessagesLoading,
    onLoadOlderMessages,
    selectedThread.id,
    selectedThread.messages.length,
  ])

  useEffect(() => {
    const wasLoading = wasMessagesLoadingRef.current
    wasMessagesLoadingRef.current = isMessagesLoading
    if (!wasLoading || isMessagesLoading) return

    requestAnimationFrame(() => {
      if (!messagesContainerRef.current) return
      shouldStickToBottomRef.current = true
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setShowUnreadPill(false)
      markUnreadMessagesAsRead()
    })
  }, [isMessagesLoading, markUnreadMessagesAsRead, selectedThread.id])

  useEffect(() => {
    if (!typingUsers.length) return
    if (!shouldStickToBottomRef.current) return
    if (!messagesContainerRef.current) return
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
  }, [typingUsers.length])

  useEffect(() => {
    if (selectedThread.unreadCount === 0) {
      setShowUnreadPill(false)
      return
    }
    if (shouldStickToBottomRef.current) {
      markUnreadMessagesAsRead()
      setShowUnreadPill(false)
      return
    }
    setShowUnreadPill(true)
  }, [markUnreadMessagesAsRead, selectedThread])

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleMessagesScroll}
      className={`flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden ${compact ? 'p-3 scrollbar-hide' : 'p-4 md:p-6'}`}
    >
      {isMessagesLoading ? (
        <div className='flex h-full min-h-[160px] items-center justify-center'>
          <Spinner loading />
        </div>
      ) : (
        <>
          {hasNoMessages ? (
            <div className='flex h-full min-h-[260px] flex-col items-center justify-center gap-4 px-4 text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50'>
                <MessageSquareText className='h-7 w-7 text-primaryColor' />
              </div>
              <p className='text-base font-bold uppercase text-gray-900'>No Messages</p>
              <p className='max-w-[260px] text-sm text-gray-500'>
                Send a message to ask anything about this case.
              </p>
            </div>
          ) : null}
          {showUnreadPill && selectedThread.unreadCount > 0 ? (
            <div className='sticky bottom-2 z-10 flex justify-center'>
              <button
                type='button'
                onClick={() => {
                  if (!messagesContainerRef.current) return
                  messagesContainerRef.current.scrollTo({
                    top: messagesContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                  })
                  shouldStickToBottomRef.current = true
                  setShowUnreadPill(false)
                  markUnreadMessagesAsRead()
                }}
                className='rounded-full bg-primaryColor px-3 py-1 text-xs font-semibold text-white shadow-sm'
              >
                {selectedThread.unreadCount} unread message
                {selectedThread.unreadCount > 1 ? 's' : ''}
              </button>
            </div>
          ) : null}
          {isLoadingMoreMessages ? (
            <div className='flex items-center justify-center py-1'>
              <Spinner loading size={14} />
            </div>
          ) : null}
          {messageItems.map((item) =>
            item.kind === 'date' ? (
              <div key={item.key} className='flex items-center justify-center'>
                <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500'>
                  {item.label}
                </span>
              </div>
            ) : (
              <MessageBubble key={item.key} message={item.message} />
            )
          )}
          {typingUsers.length > 0 && (
            <div className='flex items-center gap-2 text-xs italic text-gray-500 animate-pulse'>
              <div className='flex gap-1'>
                <span
                  className='h-1 w-1 rounded-full bg-gray-400 animate-bounce'
                  style={{animationDelay: '0ms'}}
                />
                <span
                  className='h-1 w-1 rounded-full bg-gray-400 animate-bounce'
                  style={{animationDelay: '200ms'}}
                />
                <span
                  className='h-1 w-1 rounded-full bg-gray-400 animate-bounce'
                  style={{animationDelay: '400ms'}}
                />
              </div>
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.length} people are typing...`}
            </div>
          )}
        </>
      )}
    </div>
  )
}
