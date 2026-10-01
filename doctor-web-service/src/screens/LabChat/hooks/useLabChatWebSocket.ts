import {useEffect, useRef, useCallback, useState} from 'react'
import {Client, IFrame, IMessage, StompSubscription} from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {getOrgName, getToken as getOrgToken} from '@utils/apiHelper'
import {getStorageType} from 'utils/storage'

// ─── Public types ────────────────────────────────────────────────────────────

interface WebSocketOptions {
  url: string
  /** Full message event delivered via WebSocket (NEW_MESSAGE / MESSAGE_EDITED / MESSAGE_DELETED). */
  onMessage?: (event: any) => void
  onTyping?: (event: any) => void
  onPresence?: (event: any) => void
  onReadReceipt?: (event: any) => void
  onError?: (error: string) => void
  /** Called when the client reconnects after a disconnect.  The consumer should
   *  re-fetch recent messages for the active chat to fill any gap. */
  onReconnect?: () => void
  chatId?: number
}

interface PublishMessagePayload {
  chatId: number
  profileId: number
  doctorId?: number
  organizationId?: number
  patientId?: number
  userName: string
  textContent: string
  messageType?: 'TEXT' | 'VOICE_NOTE' | 'TEXT_WITH_ATTACHMENTS'
  replyToMessageId?: number | null
}

/**
 * Reliable WebSocket hook for lab chat.
 *
 * How it ensures **zero message loss** (Slack / WhatsApp pattern):
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  1. STABLE CONNECTION — callbacks stored in refs, never trigger   │
 * │     a reconnect.  Only `url` starts a new STOMP session.          │
 * │                                                                    │
 * │  2. DUAL-CHANNEL DELIVERY — backend sends every message event to  │
 * │     BOTH `/user/queue/messages` (user-specific) AND               │
 * │     `/topic/chat/{chatId}` (topic-level).  This hook subscribes   │
 * │     to both and deduplicates by **message ID**.                    │
 * │                                                                    │
 * │  3. MESSAGE-ID  — a 60-second sliding window of seen         │
 * │     message IDs prevents the same event showing up twice even     │
 * │     if it arrives through both channels.                           │
 * │                                                                    │
 * │  4. RECONNECT RECOVERY — on reconnect, the hook calls             │
 * │     `onReconnect()` so the consumer can re-fetch recent messages  │
 * │     for the active chat from REST, filling any gap that occurred  │
 * │     while disconnected.                                            │
 * │                                                                    │
 * │  5. CHAT TOPIC SWAP — when the user switches chats, only the     │
 * │     `/topic/chat/{chatId}` subscription is swapped.  The STOMP    │
 * │     connection stays open.                                         │
 * │                                                                    │
 * │  6. HEARTBEATS at 10 s — matches the backend broker config.       │
 * │     The old 4 s value caused false-positive disconnects.           │
 * └────────────────────────────────────────────────────────────────────┘
 */
export const useLabChatWebSocket = ({
  url,
  onMessage,
  onTyping,
  onPresence,
  onReadReceipt,
  onError,
  onReconnect,
  chatId,
}: WebSocketOptions) => {
  // ── Refs for stable callback access ──────────────────────────────────
  // Storing callbacks in refs means the connection useEffect never
  // re-runs when the parent re-renders with new inline functions.
  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  const onPresenceRef = useRef(onPresence)
  const onReadReceiptRef = useRef(onReadReceipt)
  const onErrorRef = useRef(onError)
  const onReconnectRef = useRef(onReconnect)

  // Keep refs in sync with latest props (runs every render, but cheap)
  onMessageRef.current = onMessage
  onTypingRef.current = onTyping
  onPresenceRef.current = onPresence
  onReadReceiptRef.current = onReadReceipt
  onErrorRef.current = onError
  onReconnectRef.current = onReconnect

  const clientRef = useRef<Client | null>(null)
  const chatIdRef = useRef(chatId)
  chatIdRef.current = chatId

  // Track whether this is the first connect or a RE-connect
  const hasConnectedOnceRef = useRef(false)

  // Track active chat-topic subscription so we can swap without reconnecting
  const chatTopicSubRef = useRef<StompSubscription | null>(null)

  // ── Message-ID deduplication ─────────────────────────────────────────
  // Sliding window of seen (messageId → timestamp).  Events arriving
  // through both /user/queue/messages AND /topic/chat/{id} are
  // deduplicated by messageId.  Entries older than 60 s are pruned.
  const seenMessageIdsRef = useRef<Map<string, number>>(new Map())

  const [connected, setConnected] = useState(false)

  /**
   * Build a  key from an event.  Uses messageId when available
   * (most reliable), falls back to a composite key.
   */
  const buildDeduplicationKey = useCallback((event: any): string => {
    const messageId = event?.messageId ?? event?.message_id ?? event?.id
    if (messageId) return String(messageId)

    // Fallback composite for events that lack an id
    const eventType = String(event?.eventType ?? event?.event_type ?? '')
    const eChatId = String(event?.chatId ?? event?.chat_id ?? '')
    const ts = String(event?.timestamp ?? '')
    return `${eventType}:${eChatId}:${ts}`
  }, [])

  /**
   * Returns `true` if this event is new (not a duplicate).
   * Automatically registers the event in the seen-set.
   */
  const isNewEvent = useCallback(
    (event: any): boolean => {
      const key = buildDeduplicationKey(event)
      if (!key) return true // no key → let it through

      const seen = seenMessageIdsRef.current
      const now = Date.now()

      // Prune stale entries (older than 60 s)
      if (seen.size > 200) {
        seen.forEach((ts, k) => {
          if (now - ts > 60_000) seen.delete(k)
        })
      }

      if (seen.has(key)) return false
      seen.set(key, now)
      return true
    },
    [buildDeduplicationKey]
  )

  // ── Central message frame handler ────────────────────────────────────
  // Used by BOTH /user/queue/messages AND /topic/chat/{id} channels.
  // Deduplicates and dispatches to onMessage.
  const handleMessageFrame = useCallback(
    (frame: IMessage) => {
      try {
        const event = JSON.parse(frame.body)

        const eventType = String(event?.eventType ?? event?.event_type ?? '').toUpperCase()
        if (!['NEW_MESSAGE', 'MESSAGE_EDITED', 'MESSAGE_DELETED'].includes(eventType)) return

        if (!isNewEvent(event)) return // duplicate from the other channel

        onMessageRef.current?.(event)
      } catch (e) {
        console.error('[ws] Error parsing message frame', e)
      }
    },
    [isNewEvent]
  )

  // ── Chat topic frame handler ─────────────────────────────────────────
  // The /topic/chat/{id} channel carries THREE types of events:
  //   1. Message events (duplicate delivery channel)
  //   2. Typing indicators
  //   3. Read receipts
  const handleChatTopicFrame = useCallback(
    (frame: IMessage) => {
      try {
        const event = JSON.parse(frame.body)

        // ── Message events (backup delivery) ──
        const eventType = String(event?.eventType ?? event?.event_type ?? '').toUpperCase()
        if (['NEW_MESSAGE', 'MESSAGE_EDITED', 'MESSAGE_DELETED'].includes(eventType)) {
          if (isNewEvent(event)) {
            onMessageRef.current?.(event)
          }
          return
        }

        // ── Typing indicators ──
        if (event?.isTyping !== undefined || event?.is_typing !== undefined) {
          onTypingRef.current?.(event)
          return
        }

        // ── Read receipts ──
        const hasReadReceipt =
          event?.messageIds !== undefined ||
          event?.message_ids !== undefined ||
          event?.readByProfileId !== undefined ||
          event?.read_by_profile_id !== undefined ||
          event?.readerProfileId !== undefined ||
          event?.reader_profile_id !== undefined
        if (hasReadReceipt) {
          onReadReceiptRef.current?.(event)
        }
      } catch (e) {
        console.error('[ws] Error parsing chat topic frame', e)
      }
    },
    [isNewEvent]
  )

  // ── Subscribe to chat-specific topic ─────────────────────────────────
  const subscribeToChatTopic = useCallback(
    (client: Client, newChatId: number | undefined) => {
      //  old topic
      if (chatTopicSubRef.current) {
        try {
          chatTopicSubRef.current.unsubscribe()
        } catch {
          /* already gone */
        }
        chatTopicSubRef.current = null
      }
      if (!newChatId || !client.connected) return

      chatTopicSubRef.current = client.subscribe(`/topic/chat/${newChatId}`, handleChatTopicFrame)
    },
    [handleChatTopicFrame]
  )

  // ── Main connection effect ───────────────────────────────────────────
  // Depends ONLY on `url`.  All callbacks accessed via refs → no churn.
  useEffect(() => {
    const storage = getStorageType()
    const token = storage.getItem('userToken')
    if (!token) return

    const userId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
    const organizationId = storage.getItem('organizationId')
      ? Number(storage.getItem('organizationId'))
      : null
    const profileId = storage.getItem('profileId') ? Number(storage.getItem('profileId')) : null
    const organizationName = getOrgName()
    const organizationToken = getOrgToken()

    const headers: Record<string, any> = {
      Authorization: `Bearer ${token}`,
      'User-Id': userId,
      'user-id': userId,
      'User-Type': 'DOCTOR',
      'user-type': 'DOCTOR',
      organization_id: organizationId,
      'Organization-id': organizationId,
      profile_id: profileId,
      profileId: profileId,
      'Profile-id': profileId,
      'X-User-Profile-Id': profileId,
      'X-Organization-Name': organizationName,
      'x-organization-name': organizationName,
      'X-Organization-Token': organizationToken,
      'x-organization-token': organizationToken,
    }

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(url, null, {
          transportOptions: {
            xhr: {withCredentials: true, headers},
          },
        } as any),
      connectHeaders: headers,

      onConnect: () => {
        setConnected(true)

        // ── Global subscriptions (once per connection) ───────

        // 1. User-specific message queues (primary delivery)
        client.subscribe('/user/queue/messages', handleMessageFrame)
        client.subscribe('/user/messages', handleMessageFrame)

        // 2. Online/offline presence
        client.subscribe('/topic/presence', (frame: IMessage) => {
          try {
            onPresenceRef.current?.(JSON.parse(frame.body))
          } catch (e) {
            console.error('[ws] Error parsing presence frame', e)
          }
        })

        // 3. Error feedback
        client.subscribe('/user/queue/errors', (frame: IMessage) => {
          onErrorRef.current?.(frame.body)
        })

        // 4. Chat-specific topic (secondary delivery + typing + read receipts)
        subscribeToChatTopic(client, chatIdRef.current)

        // 5. On RECONNECT — tell the consumer to re-fetch recent
        //    messages for the active chat to fill any gap.
        if (hasConnectedOnceRef.current) {
          onReconnectRef.current?.()
        }
        hasConnectedOnceRef.current = true
      },

      onDisconnect: () => setConnected(false),

      onStompError: (frame: IFrame) => {
        setConnected(false)
        onErrorRef.current?.(frame.headers['message'])
      },

      onWebSocketClose: () => setConnected(false),

      // Auto-reconnect after 5 s on unexpected disconnect
      reconnectDelay: 5000,

      // 10-second heartbeats — matches the backend broker config.
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    client.activate()
    clientRef.current = client

    return () => {
      chatTopicSubRef.current = null
      client.deactivate()
      clientRef.current = null
      setConnected(false)
      hasConnectedOnceRef.current = false
    }
    // Only `url` triggers a reconnect.  Everything else is stable.
  }, [url])

  // ── Chat-topic swap (no reconnect) ───────────────────────────────────
  // When the user selects a different chat, only the topic subscription
  // is swapped.  The STOMP connection stays alive.
  useEffect(() => {
    const client = clientRef.current
    if (!client?.connected) return
    subscribeToChatTopic(client, chatId)
    return () => {
      if (chatTopicSubRef.current) {
        try {
          chatTopicSubRef.current.unsubscribe()
        } catch {
          /* ok */
        }
        chatTopicSubRef.current = null
      }
    }
  }, [chatId, subscribeToChatTopic])

  // ── Publish helpers ──────────────────────────────────────────────────

  const publishTyping = useCallback(
    (isTyping: boolean, myProfileId: number, myName: string) => {
      const currentChatId = chatIdRef.current
      if (!clientRef.current?.connected || !currentChatId) return
      clientRef.current.publish({
        destination: '/app/chat.type',
        body: JSON.stringify({
          chatId: currentChatId,
          userProfileId: myProfileId,
          userName: myName,
          isTyping,
        }),
      })
    },
    [] // stable — reads chatId from ref
  )

  const publishReadReceipt = useCallback(
    (messageIds: string[], myProfileId: number, myName: string) => {
      const currentChatId = chatIdRef.current
      if (!clientRef.current?.connected || !currentChatId || messageIds.length === 0) return
      clientRef.current.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          chatId: currentChatId,
          readerProfileId: myProfileId,
          readerName: myName,
          messageIds,
        }),
      })
    },
    [] // stable — reads chatId from ref
  )

  const publishMessage = useCallback(
    ({
      chatId: targetChatId,
      profileId,
      doctorId,
      organizationId,
      patientId,
      userName,
      textContent,
      messageType = 'TEXT',
      replyToMessageId = null,
    }: PublishMessagePayload) => {
      if (!clientRef.current?.connected || !targetChatId) return false

      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          chatId: targetChatId,
          chat_id: targetChatId,
          profileId,
          profile_id: profileId,
          userProfileId: profileId,
          user_profile_id: profileId,
          doctorId,
          doctor_id: doctorId,
          organizationId,
          organization_id: organizationId,
          patientId,
          patient_id: patientId,
          userName,
          user_name: userName,
          textContent,
          text_content: textContent,
          messageType,
          message_type: messageType,
          replyToMessageId,
          reply_to_message_id: replyToMessageId,
        }),
      })

      return true
    },
    []
  )

  return {
    publishTyping,
    publishReadReceipt,
    publishMessage,
    isConnected: connected,
  }
}
