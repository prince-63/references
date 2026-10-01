import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {RootState} from 'redux/store'
import {
  addLabChatParticipants,
  createLabAlignerCheckIn,
  createLabChat,
  getLatestAlignerCheckIn,
  getLabChatById,
  getLabChatMessages,
  getLabChats,
  sendLabChatMessage,
} from 'redux/Slices/AppSlice/LabChat/LabChat.slice'
import type {LabChatByIdResponse} from 'redux/Slices/AppSlice/LabChat/LabChat.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  ComposeMessagePayload,
  LabChatAttachment,
  LabChatMessage,
  LabChatProgress,
  LabChatThread,
} from '../types'
import type {QuickCheckInData} from '../components/QuickCheckInModal'
import {useLabChatWebSocket} from './useLabChatWebSocket'
import {updateLabChatUnreadCount} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'

const toRelativeTimeLabel = (value: unknown) => {
  if (!value) return 'Just now'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return 'Just now'
  const diffInMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

const toTimeLabel = (value: unknown) => {
  if (!value) return 'Now'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})
}

const normalizeMessageType = (value: unknown): LabChatMessage['type'] => {
  const candidate = String(value || '')
    .toLowerCase()
    .trim()
  if (candidate.includes('aligner_check_in') || candidate.includes('aligner check')) {
    return 'aligner_check_in'
  }
  if (candidate.includes('pdf')) return 'pdf'
  if (candidate.includes('image') || candidate.includes('photo')) return 'image'
  if (candidate.includes('video')) return 'video'
  if (candidate.includes('voice') || candidate.includes('audio')) return 'voice'
  return 'text'
}

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'svg',
  'heic',
  'heif',
])
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm'])
const PDF_EXTENSIONS = new Set(['pdf'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi', 'wmv', 'flv', '3gp'])
const LAB_CHAT_PAGE_SIZE = 10
const LAB_CHAT_MESSAGES_PAGE_SIZE = 20

const toAttachmentArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value
  if (!value) return []
  if (typeof value === 'string') return [{url: value}]
  if (typeof value === 'object') return [value]
  return []
}

const extractMessageAttachments = (message: any): any[] => {
  if (!message) return []

  return [
    ...toAttachmentArray(message?.attachments),
    ...toAttachmentArray(message?.files),
    ...toAttachmentArray(message?.attachment),
    ...toAttachmentArray(message?.file),
    ...toAttachmentArray(message?.message?.attachments),
    ...toAttachmentArray(message?.message?.files),
    ...toAttachmentArray(message?.message?.attachment),
    ...toAttachmentArray(message?.message?.file),
  ]
}

const getFirstAttachment = (message: any) => {
  if (!message) return null
  const attachments = extractMessageAttachments(message)
  return attachments[0] ?? null
}

const getAttachmentUrl = (message: any) => {
  const attachment = getFirstAttachment(message)
  return (
    message?.attachmentUrl ??
    message?.attachment_url ??
    message?.audio_url ??
    message?.audioUrl ??
    message?.fileUrl ??
    message?.file_url ??
    message?.download_url ??
    message?.message?.attachmentUrl ??
    message?.message?.attachment_url ??
    message?.message?.audio_url ??
    message?.message?.audioUrl ??
    message?.message?.fileUrl ??
    message?.message?.file_url ??
    message?.message?.download_url ??
    message?.message?.full_path ??
    message?.full_path ??
    attachment?.url ??
    attachment?.public_url ??
    attachment?.file_url ??
    attachment?.fileUrl ??
    attachment?.download_url ??
    attachment?.thumbnail_url ??
    attachment?.full_path ??
    attachment?.path ??
    ''
  )
}

const getAttachmentName = (message: any) => {
  const attachment = getFirstAttachment(message)
  return (
    message?.attachmentName ??
    message?.attachment_name ??
    message?.audio_name ??
    message?.audioName ??
    message?.fileName ??
    message?.file_name ??
    message?.message?.attachmentName ??
    message?.message?.attachment_name ??
    message?.message?.audio_name ??
    message?.message?.audioName ??
    message?.message?.fileName ??
    message?.message?.file_name ??
    attachment?.name ??
    attachment?.file_name ??
    attachment?.filename ??
    attachment?.original_file_name ??
    ''
  )
}

const inferTypeFromAttachment = (message: any): LabChatMessage['type'] | null => {
  const attachment = getFirstAttachment(message)
  if (!attachment) return null

  const mimeType = String(
    attachment?.mime_type ??
      attachment?.content_type ??
      attachment?.file_type ??
      message?.mime_type ??
      ''
  ).toLowerCase()
  const attachmentUrl = getAttachmentUrl(message)
  const attachmentName = getAttachmentName(message)
  const extension = String(
    attachment?.extension ??
      attachment?.name?.split('.').pop() ??
      attachment?.file_name?.split('.').pop() ??
      attachmentName?.split('.').pop() ??
      attachmentUrl?.split('?')[0]?.split('.').pop() ??
      ''
  ).toLowerCase()

  if (mimeType.includes('image') || IMAGE_EXTENSIONS.has(extension)) return 'image'
  if (mimeType.includes('audio') || AUDIO_EXTENSIONS.has(extension)) return 'voice'
  if (mimeType.includes('video') || VIDEO_EXTENSIONS.has(extension)) return 'video'
  if (mimeType.includes('pdf') || extension === 'pdf') return 'pdf'

  return null
}

const normalizeSenderRole = (value: unknown): LabChatMessage['senderRole'] => {
  const candidate = String(value || '')
    .toLowerCase()
    .trim()
  return candidate.includes('lab') ? 'lab' : 'practice'
}

const extractMessageList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.messages)) return payload.messages
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.content)) return payload.data.content
  if (Array.isArray(payload?.data?.messages)) return payload.data.messages
  if (Array.isArray(payload?._embedded?.messages)) return payload._embedded.messages
  if (Array.isArray(payload?._embedded?.chatMessages)) return payload._embedded.chatMessages
  if (Array.isArray(payload?.data?._embedded?.messages)) return payload.data._embedded.messages
  if (Array.isArray(payload?.data?._embedded?.chatMessages))
    return payload.data._embedded.chatMessages
  return []
}

const toThreadId = (chatId: number) => `chat-${chatId}`
const isMobileViewport = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

const resolveChatIdFromThreadId = (threadId: string) =>
  safeParseInt(
    String(threadId ?? '')
      .split('-')
      .pop()
  )

const resolvePatientIdFromThread = (thread: LabChatThread) => {
  const parsed = safeParseInt(thread.patientId)
  if (parsed > 0) return parsed

  const digitsOnly = String(thread.patientId).replace(/\D/g, '')
  return safeParseInt(digitsOnly)
}

const shouldFetchLatestAlignerCheckInForThread = (thread: LabChatThread) => {
  const treatmentProgress = String(thread.treatmentProgress ?? '').toLowerCase()
  const lastMessagePreview = String(thread.lastMessagePreview ?? '').toLowerCase()
  const hasAlignerHintInProgress = treatmentProgress.includes('aligner')
  const hasAlignerHintInPreview = lastMessagePreview.includes('aligner')
  const hasAlignerCheckInMessage = thread.messages.some(
    (message) => String(message.type ?? '').toLowerCase() === 'aligner_check_in'
  )

  return hasAlignerHintInProgress || hasAlignerHintInPreview || hasAlignerCheckInMessage
}

const getInitials = (name: string) => {
  const words = name
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)

  if (words.length === 0) return 'LC'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

const getFileNameFromUrl = (url: string) => {
  if (!url) return ''
  try {
    const sanitizedUrl = url.split('?')[0]
    const fileName = sanitizedUrl.split('/').pop() || ''
    return decodeURIComponent(fileName)
  } catch {
    return ''
  }
}

const toGroupInfoErrorMessage = (error: unknown) => {
  if (!error) return 'Unable to load group details.'
  if (typeof error === 'string') return error
  if (typeof error === 'object') {
    const typedError = error as {
      message?: string
      error?: string
      status?: {message?: string}
    }
    if (typedError.message) return typedError.message
    if (typedError.error) return typedError.error
    if (typedError.status?.message) return typedError.status.message
  }
  return 'Unable to load group details.'
}

const normalizeFileAttachment = (file: any) => {
  if (!file) return null

  if (typeof file === 'string') {
    return {
      name: getFileNameFromUrl(file) || 'Attachment',
      url: file,
      is_gdrive_platform: false,
    }
  }

  const fileUrl =
    file?.url ?? file?.file_url ?? file?.download_url ?? file?.thumbnail_url ?? file?.path ?? ''
  const fileName =
    file?.name ??
    file?.file_name ??
    file?.filename ??
    file?.original_file_name ??
    getFileNameFromUrl(fileUrl)

  if (!fileUrl && !fileName) return null

  return {
    name: String(fileName || 'Attachment'),
    url: fileUrl ? String(fileUrl) : undefined,
    is_gdrive_platform: Boolean(file?.is_gdrive_platform),
    drive_file_id: file?.drive_file_id != null ? String(file.drive_file_id) : undefined,
  }
}

const getNormalizedAttachmentKey = (attachment: Partial<LabChatAttachment>) =>
  [
    String(attachment.drive_file_id ?? '').trim(),
    String(attachment.url ?? '').trim(),
    String(attachment.name ?? '').trim(),
    String(attachment.type ?? '').trim(),
  ].join('::')

const dedupeNormalizedAttachments = (attachments: LabChatAttachment[]) => {
  const seenKeys = new Set<string>()

  return attachments.filter((attachment) => {
    const key = getNormalizedAttachmentKey(attachment)
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })
}

const inferAttachmentKind = (
  file: any,
  fallbackName = '',
  fallbackUrl = ''
): LabChatAttachment['type'] => {
  const mimeType = String(
    file?.mime_type ?? file?.content_type ?? file?.file_type ?? file?.mimeType ?? ''
  ).toLowerCase()
  const extension = String(
    file?.extension ??
      file?.name?.split('.').pop() ??
      file?.file_name?.split('.').pop() ??
      fallbackName?.split('.').pop() ??
      fallbackUrl?.split('?')[0]?.split('.').pop() ??
      ''
  ).toLowerCase()

  if (mimeType.includes('image') || IMAGE_EXTENSIONS.has(extension)) return 'image'
  if (mimeType.includes('audio') || AUDIO_EXTENSIONS.has(extension)) return 'voice'
  if (mimeType.includes('video') || VIDEO_EXTENSIONS.has(extension)) return 'video'
  if (mimeType.includes('pdf') || PDF_EXTENSIONS.has(extension)) return 'pdf'
  return 'file'
}

const normalizeMessageAttachments = (message: any): LabChatAttachment[] => {
  const attachments = extractMessageAttachments(message)
  const normalizedFromArray = dedupeNormalizedAttachments(
    attachments
      .map((attachment: any) => {
        const normalized = normalizeFileAttachment(attachment)
        if (!normalized) return null
        return {
          ...normalized,
          type: inferAttachmentKind(attachment, normalized.name ?? '', normalized.url ?? ''),
        }
      })
      .filter(Boolean) as LabChatAttachment[]
  )

  if (normalizedFromArray.length > 0) return normalizedFromArray

  const fallbackUrl = getAttachmentUrl(message)
  const fallbackName = getAttachmentName(message)
  if (!fallbackUrl && !fallbackName) return []

  return [
    {
      name: fallbackName || 'Attachment',
      url: fallbackUrl || undefined,
      is_gdrive_platform: Boolean(message?.is_gdrive_platform),
      drive_file_id: message?.drive_file_id != null ? String(message.drive_file_id) : undefined,
      type: inferAttachmentKind(message, fallbackName, fallbackUrl),
    },
  ]
}

const mapApiMessagesToThreadMessages = (
  payload: any,
  thread: LabChatThread,
  currentProfileId: number | null,
  currentUserId: number | null,
  currentUserEmail?: string | null
): LabChatMessage[] => {
  const rawMessages = extractMessageList(payload)
  if (rawMessages.length === 0) return thread.messages

  const sortedMessages = rawMessages
    .map((message: any, index: number) => ({
      message,
      index,
      createdAt:
        message?.createdAt ??
        message?.created_at ??
        message?.timestamp ??
        message?.last_message_at ??
        null,
    }))
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(String(left.createdAt)).getTime() : Number.NaN
      const rightTime = right.createdAt ? new Date(String(right.createdAt)).getTime() : Number.NaN
      const leftIsValid = Number.isFinite(leftTime)
      const rightIsValid = Number.isFinite(rightTime)
      const leftId = safeParseInt(left.message?.id)
      const rightId = safeParseInt(right.message?.id)

      if (leftIsValid && rightIsValid && leftTime !== rightTime) {
        return leftTime - rightTime
      }

      if (leftId > 0 && rightId > 0 && leftId !== rightId) {
        return leftId - rightId
      }

      return left.index - right.index
    })
    .map(({message}) => message)

  return sortedMessages.map((message: any, index: number) => {
    const createdAtRaw =
      message?.createdAt ??
      message?.created_at ??
      message?.timestamp ??
      message?.last_message_at ??
      null
    const toUniquePositiveIds = (values: unknown[]) =>
      Array.from(
        new Set(
          values
            .map((value) => safeParseInt(value))
            .filter((value) => Number.isFinite(value) && value > 0)
        )
      )
    const senderProfileIds = toUniquePositiveIds([
      message?.sender?.profile_id,
      message?.sender?.profileId,
      message?.profile_id,
      message?.profileId,
      message?.sender_profile_id,
      message?.senderProfileId,
      message?.created_by_profile_id,
      message?.createdByProfileId,
    ])
    const senderUserIds = toUniquePositiveIds([
      message?.sender?.user_id,
      message?.sender?.userId,
      message?.user_id,
      message?.userId,
      message?.sender_user_id,
      message?.senderUserId,
      message?.created_by,
      message?.createdBy,
      message?.doctor_id,
      message?.doctorId,
    ])
    const senderGenericIds = toUniquePositiveIds([
      message?.sender?.id,
      message?.senderId,
      message?.sender_id,
    ])
    const senderEmail = (
      message?.senderEmail ??
      message?.sender_email ??
      message?.email ??
      message?.sender?.email
    )
      ?.toString()
      .trim()
      .toLowerCase()

    const isOwnMessageByProfileId =
      !!currentProfileId && [...senderProfileIds, ...senderGenericIds].includes(currentProfileId)
    const userIdsToCompare = senderUserIds.length > 0 ? senderUserIds : senderGenericIds
    const isOwnMessageByUserId = !!currentUserId && userIdsToCompare.includes(currentUserId)
    const isOwnMessageByEmail =
      !!currentUserEmail && !!senderEmail && senderEmail === currentUserEmail.trim().toLowerCase()

    const isOwnMessage = isOwnMessageByProfileId || isOwnMessageByUserId || isOwnMessageByEmail
    const senderNameFromPayload = (
      message?.senderName ??
      message?.sender_name ??
      message?.sender?.name ??
      ''
    )
      .toString()
      .trim()
      .toLowerCase()
    const practiceName = (thread.practiceName ?? '').trim().toLowerCase()
    const labName = (thread.labName ?? '').trim().toLowerCase()
    const senderRole =
      senderNameFromPayload && senderNameFromPayload === labName
        ? 'lab'
        : senderNameFromPayload && senderNameFromPayload === practiceName
          ? 'practice'
          : normalizeSenderRole(
              message?.senderRole ?? message?.sender_type ?? message?.senderType ?? message?.role
            )
    const normalizedMessageAttachments = normalizeMessageAttachments(message)
    const primaryAttachment = normalizedMessageAttachments[0]
    const attachmentName = getAttachmentName(message)
    const attachmentUrl = getAttachmentUrl(message)
    const resolvedTypeFromMessage = normalizeMessageType(
      message?.type ?? message?.messageType ?? message?.message_type ?? message?.messageType
    )
    const rawAlignerCheckIn = message?.aligner_check_in ?? message?.alignerCheckIn
    const normalizedAlignerFilesSource = Array.isArray(rawAlignerCheckIn?.files)
      ? rawAlignerCheckIn.files
      : Array.isArray(rawAlignerCheckIn?.attachments)
        ? rawAlignerCheckIn.attachments
        : []
    const normalizedAlignerFiles = dedupeNormalizedAttachments(
      normalizedAlignerFilesSource
        .map((file: any) => {
          const normalized = normalizeFileAttachment(file)
          if (!normalized) return null
          return {
            ...normalized,
            type: inferAttachmentKind(file, normalized.name ?? '', normalized.url ?? ''),
          }
        })
        .filter(Boolean) as LabChatAttachment[]
    )
    const inferredType = inferTypeFromAttachment(message)
    const resolvedType = rawAlignerCheckIn
      ? 'aligner_check_in'
      : resolvedTypeFromMessage === 'text' && inferredType
        ? inferredType
        : resolvedTypeFromMessage
    const checkInAlignerNumber = safeParseInt(
      rawAlignerCheckIn?.aligner_number ?? rawAlignerCheckIn?.alignerNumber
    )
    const checkInNotes = rawAlignerCheckIn?.notes ? String(rawAlignerCheckIn.notes) : ''
    const checkInContentParts = [
      checkInAlignerNumber ? `Aligner #${checkInAlignerNumber}` : undefined,
      checkInNotes ? `Notes: ${checkInNotes}` : undefined,
      normalizedAlignerFiles.length ? `Files: ${normalizedAlignerFiles.length}` : undefined,
    ].filter(Boolean)
    const content =
      (resolvedType === 'aligner_check_in' ? checkInContentParts.join(' • ') : undefined) ??
      message?.content ??
      message?.message ??
      message?.text ??
      message?.textContent ??
      message?.text_content ??
      (attachmentName ? `Attachment: ${attachmentName}` : '')

    return {
      id: String(
        message?.id ?? message?.messageId ?? message?.message_id ?? `${thread.id}-message-${index}`
      ),
      senderRole,
      isOwnMessage,
      senderName:
        message?.senderName ??
        message?.sender_name ??
        message?.sender?.name ??
        (senderRole === 'lab' ? thread.labName : thread.practiceName),
      content: String(content),
      timestamp: toTimeLabel(createdAtRaw),
      createdAt: createdAtRaw ? String(createdAtRaw) : null,
      type: resolvedType,
      attachmentName: primaryAttachment?.name ?? attachmentName,
      attachmentUrl: primaryAttachment?.url ?? attachmentUrl,
      attachments: normalizedMessageAttachments,
      alignerCheckIn:
        resolvedType === 'aligner_check_in'
          ? {
              alignerNumber: checkInAlignerNumber || undefined,
              notes: checkInNotes || undefined,
              files: normalizedAlignerFiles,
            }
          : undefined,
    }
  })
}

const mergeMessagePreferringRicherPayload = (
  previousMessage: LabChatMessage,
  nextMessage: LabChatMessage
): LabChatMessage => {
  const previousAttachments = Array.isArray(previousMessage.attachments)
    ? previousMessage.attachments
    : []
  const nextAttachments = Array.isArray(nextMessage.attachments) ? nextMessage.attachments : []
  const hasNextAttachmentData =
    nextAttachments.length > 0 ||
    !!String(nextMessage.attachmentUrl ?? '').trim() ||
    !!String(nextMessage.attachmentName ?? '').trim()

  return {
    ...previousMessage,
    ...nextMessage,
    content: String(nextMessage.content ?? previousMessage.content ?? ''),
    attachmentUrl: hasNextAttachmentData
      ? (nextMessage.attachmentUrl ?? previousMessage.attachmentUrl)
      : previousMessage.attachmentUrl,
    attachmentName: hasNextAttachmentData
      ? (nextMessage.attachmentName ?? previousMessage.attachmentName)
      : previousMessage.attachmentName,
    attachments: hasNextAttachmentData
      ? nextAttachments.length > 0
        ? nextAttachments
        : previousAttachments
      : previousAttachments,
    type:
      nextMessage.type === 'text' && previousMessage.type !== 'text'
        ? previousMessage.type
        : nextMessage.type,
  }
}

const pickIncomingMessagePayload = (event: any) => {
  const candidates = [event?.message, event?.data?.message, event?.data, event?.payload, event]
    .filter(Boolean)
    .map((candidate) => {
      const attachments = extractMessageAttachments(candidate)
      const attachmentUrl = getAttachmentUrl(candidate)
      const score = attachments.length * 10 + (attachmentUrl ? 1 : 0)
      return {candidate, score}
    })

  if (candidates.length === 0) return event
  candidates.sort((left, right) => right.score - left.score)
  return candidates[0].candidate
}

const extractChatsList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.chats)) return payload.chats
  if (Array.isArray(payload?._embedded?.chats)) return payload._embedded.chats
  if (Array.isArray(payload?._embedded?.chatList)) return payload._embedded.chatList
  return []
}

const extractChatsPagination = (payload: any) => {
  if (payload?.pagination_details && typeof payload.pagination_details === 'object') {
    return payload.pagination_details
  }
  if (payload?.pagination && typeof payload.pagination === 'object') {
    return payload.pagination
  }
  if (payload?.page && typeof payload.page === 'object') {
    return payload.page
  }
  return null
}

const extractMessagesPagination = (payload: any) => {
  if (payload?.pagination_details && typeof payload.pagination_details === 'object') {
    return payload.pagination_details
  }
  if (payload?.pagination && typeof payload.pagination === 'object') {
    return payload.pagination
  }
  if (payload?.page && typeof payload.page === 'object') {
    return payload.page
  }
  if (payload?.data?.pagination_details && typeof payload.data.pagination_details === 'object') {
    return payload.data.pagination_details
  }
  if (payload?.data?.pagination && typeof payload.data.pagination === 'object') {
    return payload.data.pagination
  }
  if (payload?.data?.page && typeof payload.data.page === 'object') {
    return payload.data.page
  }
  return null
}

const sortMessagesChronologically = (messages: LabChatMessage[]) =>
  [...messages].sort((left, right) => {
    const leftCreatedAt = left.createdAt ? new Date(left.createdAt).getTime() : Number.NaN
    const rightCreatedAt = right.createdAt ? new Date(right.createdAt).getTime() : Number.NaN
    const leftCreatedAtValid = Number.isFinite(leftCreatedAt)
    const rightCreatedAtValid = Number.isFinite(rightCreatedAt)

    if (leftCreatedAtValid && rightCreatedAtValid && leftCreatedAt !== rightCreatedAt) {
      return leftCreatedAt - rightCreatedAt
    }

    const leftId = safeParseInt(left.id)
    const rightId = safeParseInt(right.id)
    if (leftId > 0 && rightId > 0 && leftId !== rightId) {
      return leftId - rightId
    }

    return String(left.id).localeCompare(String(right.id))
  })

const getLastMessagePreview = (chat: any, lastMessage: LabChatMessage | undefined) => {
  const rawMessageType = normalizeMessageType(
    chat?.last_message?.message_type ??
      chat?.lastMessage?.message_type ??
      chat?.lastMessage?.messageType ??
      ''
  )
  const inferredType = inferTypeFromAttachment(chat?.last_message ?? chat?.lastMessage)
  const messageType =
    rawMessageType === 'text' && inferredType ? inferredType : (lastMessage?.type ?? rawMessageType)

  if (messageType.includes('aligner_check_in')) return 'Aligner check-in updated'
  if (messageType.includes('voice')) return 'Voice note sent'
  if (messageType.includes('pdf')) return 'PDF shared'
  if (messageType.includes('image') || messageType.includes('photo')) return 'Image shared'
  if (messageType.includes('video')) return 'Video shared'

  return (
    chat?.last_message?.text_content ??
    chat?.lastMessage?.text_content ??
    chat?.lastMessagePreview ??
    chat?.last_message_preview ??
    chat?.lastMessage ??
    lastMessage?.content ??
    'No messages yet'
  )
}

const mapApiChatToThread = (
  chat: any,
  currentProfileId: number | null,
  currentUserId: number | null,
  currentUserEmail?: string | null
): LabChatThread => {
  const chatId = safeParseInt(chat?.id ?? chat?.chat_id ?? chat?.chatId)
  const patientName =
    chat?.patient?.name ??
    chat?.patientName ??
    chat?.patient_name ??
    chat?.display_name ??
    chat?.displayName ??
    '--'
  const patientAddedByName =
    chat?.patient_added_by_name ?? chat?.patientAddedByName ?? chat?.patient_added_by?.name ?? ''
  const patientId = safeParseInt(chat?.patient?.id ?? chat?.patient_id ?? chat?.patientId)
  const practiceName = chat?.practice_name ?? chat?.practiceName ?? chat?.practice?.name ?? '--'
  const labName = chat?.lab_name ?? chat?.labName ?? chat?.lab?.name ?? '--'
  const treatmentProgress =
    chat?.treatment_progress ?? chat?.alignerProgress ?? chat?.chat_name ?? '--'
  const unreadCount = Number(chat?.unreadCount ?? chat?.unread_count ?? 0)
  const messages = mapApiMessagesToThreadMessages(
    chat,
    {
      id: toThreadId(chatId),
      patientName: String(patientName),
      patient_added_by_name: String(patientAddedByName),
      patientId: String(patientId),
      patientInitials: getInitials(String(patientName)),
      treatmentProgress: String(treatmentProgress),
      practiceName: String(practiceName),
      labName: String(labName),
      lastUpdated: 'Just now',
      unreadCount: Number.isNaN(unreadCount) ? 0 : unreadCount,
      lastMessagePreview: '',
      messages: [],
    },
    currentProfileId,
    currentUserId,
    currentUserEmail
  )
  const lastMessageFromPayload = chat?.last_message ? [chat.last_message] : []
  const mergedMessages =
    messages.length > 0
      ? messages
      : mapApiMessagesToThreadMessages(
          lastMessageFromPayload,
          {
            id: toThreadId(chatId),
            patientName: String(patientName),
            patient_added_by_name: String(patientAddedByName),
            patientId: String(patientId),
            patientInitials: getInitials(String(patientName)),
            treatmentProgress: String(treatmentProgress),
            practiceName: String(practiceName),
            labName: String(labName),
            lastUpdated: 'Just now',
            unreadCount: Number.isNaN(unreadCount) ? 0 : unreadCount,
            lastMessagePreview: '',
            messages: [],
          },
          currentProfileId,
          currentUserId,
          currentUserEmail
        )
  const lastMessage = mergedMessages[mergedMessages.length - 1]
  const lastMessagePreview = getLastMessagePreview(chat, lastMessage)

  return {
    id: toThreadId(chatId),
    patientName: String(patientName),
    patient_added_by_name: String(patientAddedByName),
    customer_name: String(chat?.customer_name ?? chat?.customerName ?? chat?.customer?.name ?? ''),
    patientId: String(patientId),
    patientInitials: getInitials(String(patientName)),
    treatmentProgress: String(treatmentProgress),
    practiceName: String(practiceName),
    labName: String(labName),
    lastUpdated: toRelativeTimeLabel(
      chat?.updatedAt ??
        chat?.updated_at ??
        chat?.last_message_at ??
        chat?.lastMessageTime ??
        chat?.last_message_time ??
        chat?.timestamp
    ),
    unreadCount: Number.isNaN(unreadCount) ? 0 : unreadCount,
    lastMessagePreview: String(lastMessagePreview),
    messages: mergedMessages,
    customer_mapped_id: String(
      chat?.customer_mapped_id ?? chat?.customerMappedId ?? chat?.customer_mappedId ?? ''
    ),
  }
}

type LabChatSidebarOptions = {
  disableChatListFetch?: boolean
  initialChatId?: number | null
}

export const useLabChatSidebar = (options: LabChatSidebarOptions = {}) => {
  const {disableChatListFetch = false, initialChatId = null} = options
  const [threads, setThreads] = useState<LabChatThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string>('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentChatsPage, setCurrentChatsPage] = useState(0)
  const [hasMoreChats, setHasMoreChats] = useState(true)
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false)
  const [messagesPageByChatId, setMessagesPageByChatId] = useState<Record<number, number>>({})
  const [hasMoreMessagesByChatId, setHasMoreMessagesByChatId] = useState<Record<number, boolean>>(
    {}
  )
  const [hasFetchedMessagesByChatId, setHasFetchedMessagesByChatId] = useState<
    Record<number, boolean>
  >({})
  const [isLoadingMessagesByChatId, setIsLoadingMessagesByChatId] = useState<
    Record<number, boolean>
  >({})
  const [isLoadingMoreMessagesByChatId, setIsLoadingMoreMessagesByChatId] = useState<
    Record<number, boolean>
  >({})
  const [latestAlignerProgressByPatientId, setLatestAlignerProgressByPatientId] = useState<
    Record<number, LabChatProgress>
  >({})
  const [groupInfoByChatId, setGroupInfoByChatId] = useState<Record<number, LabChatByIdResponse>>(
    {}
  )
  const [groupInfoLoadingByChatId, setGroupInfoLoadingByChatId] = useState<Record<number, boolean>>(
    {}
  )
  const [groupInfoErrorByChatId, setGroupInfoErrorByChatId] = useState<
    Record<number, string | null>
  >({})
  const [assignCaseTeamLoading, setAssignCaseTeamLoading] = useState(false)
  const [assignCaseTeamError, setAssignCaseTeamError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Record<number, string[]>>({})
  const fetchedAlignerCheckInPatientIdsRef = useRef<Set<number>>(new Set())
  const inFlightAlignerCheckInPatientIdsRef = useRef<Set<number>>(new Set())
  const chatsRequestRef = useRef(0)
  const isFetchingMoreChatsRef = useRef(false)
  const isFetchingMoreMessagesByChatIdRef = useRef<Record<number, boolean>>({})
  const messagesFetchRequestRef = useRef<Record<number, number>>({})
  const {profileId, userId, organizationId, userDetail} = useContext(AuthContext)
  const currentUserEmail = userDetail?.email
  const {dispatchAction} = useDispatchAction()
  const {
    loading,
    error,
    messagesLoading,
    messagesError,
    sendLoading,
    sendError,
    createLoading,
    createAlignerCheckInLoading,
    createAlignerCheckInError,
  } = useSelector((state: RootState) => state.labChat)

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId),
    [selectedThreadId, threads]
  )
  const parsedProfileId = safeParseInt(profileId)
  const parsedUserId = safeParseInt(userId)
  const parsedOrganizationId = safeParseInt(organizationId)
  const selectedThreadChatId = useMemo(
    () => (selectedThread ? resolveChatIdFromThreadId(selectedThread.id) : 0),
    [selectedThread]
  )

  const fetchLatestAlignerCheckInForPatient = useCallback(
    async (patientId: number, force = false): Promise<LabChatProgress | null> => {
      if (!patientId) return null
      if (force) {
        fetchedAlignerCheckInPatientIdsRef.current.delete(patientId)
      }
      if (fetchedAlignerCheckInPatientIdsRef.current.has(patientId)) return null
      if (inFlightAlignerCheckInPatientIdsRef.current.has(patientId)) return null

      inFlightAlignerCheckInPatientIdsRef.current.add(patientId)
      const action = await dispatchAction(
        getLatestAlignerCheckIn({
          patient_id: patientId,
          profile_id: safeParseInt(profileId) || undefined,
        })
      )

      if (!getLatestAlignerCheckIn.fulfilled.match(action)) {
        fetchedAlignerCheckInPatientIdsRef.current.add(patientId)
        inFlightAlignerCheckInPatientIdsRef.current.delete(patientId)
        return null
      }

      const payload: any = action.payload
      const alignerNumber = safeParseInt(payload?.aligner_number ?? payload?.alignerNumber)
      const totalAligners = safeParseInt(payload?.total_aligners ?? payload?.totalAligners)
      if (!alignerNumber) {
        fetchedAlignerCheckInPatientIdsRef.current.add(patientId)
        inFlightAlignerCheckInPatientIdsRef.current.delete(patientId)
        return null
      }

      const rawProgress = Number(payload?.progress_percentage ?? payload?.progressPercentage)
      const progressPercentage = Number.isFinite(rawProgress)
        ? Math.max(0, Math.min(100, Math.round(rawProgress)))
        : totalAligners > 0
          ? Math.max(0, Math.min(100, Math.round((alignerNumber / totalAligners) * 100)))
          : 0

      const normalizedProgress: LabChatProgress = {
        alignerNumber,
        totalAligners: totalAligners > 0 ? totalAligners : alignerNumber,
        progressPercentage,
      }

      setLatestAlignerProgressByPatientId((previous) => ({
        ...previous,
        [patientId]: normalizedProgress,
      }))
      fetchedAlignerCheckInPatientIdsRef.current.add(patientId)
      inFlightAlignerCheckInPatientIdsRef.current.delete(patientId)

      return normalizedProgress
    },
    [dispatchAction, profileId]
  )

  const fetchChats = useCallback(
    async ({
      page = 0,
      preferredThreadId,
      search = searchQuery,
      append = false,
    }: {
      page?: number
      preferredThreadId?: string
      search?: string
      append?: boolean
    } = {}) => {
      if (append && isFetchingMoreChatsRef.current) return

      if (append) {
        isFetchingMoreChatsRef.current = true
        setIsLoadingMoreChats(true)
      }

      const requestId = ++chatsRequestRef.current

      const action = await dispatchAction(
        getLabChats({
          page,
          size: LAB_CHAT_PAGE_SIZE,
          profileId: safeParseInt(profileId) || undefined,
          customerIds: selectedCustomerId ? [selectedCustomerId] : [],
          doctorId: safeParseInt(userId) || undefined,
          organizationId: safeParseInt(organizationId) || undefined,
          search: search.trim(),
        })
      )

      if (requestId !== chatsRequestRef.current) {
        if (append) {
          isFetchingMoreChatsRef.current = false
          setIsLoadingMoreChats(false)
        }
        return
      }

      if (!getLabChats.fulfilled.match(action)) {
        if (append) {
          isFetchingMoreChatsRef.current = false
          setIsLoadingMoreChats(false)
        }
        return
      }

      const mappedThreads = extractChatsList(action.payload).map((chat: any) =>
        mapApiChatToThread(chat, parsedProfileId, parsedUserId, currentUserEmail)
      )
      const paginationDetails = extractChatsPagination(action.payload)
      const resolvedCurrentPage = safeParseInt(
        paginationDetails?.page_number ?? paginationDetails?.pageNumber
      )
      const resolvedTotalPages = safeParseInt(
        paginationDetails?.total_pages ?? paginationDetails?.totalPages
      )
      const nextPage = resolvedCurrentPage >= 0 ? resolvedCurrentPage : page
      const nextTotalPages = resolvedTotalPages > 0 ? resolvedTotalPages : 1
      const nextHasMoreChats = nextPage + 1 < nextTotalPages

      setCurrentChatsPage(nextPage)
      setHasMoreChats(nextHasMoreChats)

      if (append) {
        setThreads((previousThreads) => {
          const existingThreadMap = new Map(previousThreads.map((thread) => [thread.id, thread]))
          mappedThreads.forEach((thread) => {
            if (!existingThreadMap.has(thread.id)) {
              existingThreadMap.set(thread.id, thread)
            }
          })
          return Array.from(existingThreadMap.values())
        })
        setSelectedThreadId(
          (previousSelectedThreadId) =>
            previousSelectedThreadId ||
            (!isMobileViewport() ? String(mappedThreads[0]?.id ?? '') : '')
        )
      } else {
        setThreads((previousThreads) => {
          const existingThreadMap = new Map(previousThreads.map((thread) => [thread.id, thread]))
          return mappedThreads.map((thread) => {
            const existingThread = existingThreadMap.get(thread.id)
            if (!existingThread || existingThread.messages.length === 0) {
              return thread
            }
            if (thread.messages.length === 0) {
              return {
                ...thread,
                messages: existingThread.messages,
                lastMessagePreview: existingThread.lastMessagePreview,
                lastUpdated: existingThread.lastUpdated,
              }
            }
            const mergedMessageMap = new Map<string, LabChatMessage>()
            existingThread.messages.forEach((message) => {
              mergedMessageMap.set(message.id, message)
            })
            thread.messages.forEach((message) => {
              mergedMessageMap.set(message.id, message)
            })
            const mergedMessages = sortMessagesChronologically(
              Array.from(mergedMessageMap.values())
            )
            const lastMessage = mergedMessages[mergedMessages.length - 1]
            return {
              ...thread,
              messages: mergedMessages,
              lastMessagePreview: lastMessage?.content ?? thread.lastMessagePreview,
            }
          })
        })
        setSelectedThreadId((previousSelectedThreadId) =>
          preferredThreadId && mappedThreads.some((thread) => thread.id === preferredThreadId)
            ? preferredThreadId
            : mappedThreads.some((thread) => thread.id === previousSelectedThreadId)
              ? previousSelectedThreadId
              : !isMobileViewport()
                ? String(mappedThreads[0]?.id ?? '')
                : ''
        )
      }

      if (append) {
        isFetchingMoreChatsRef.current = false
        setIsLoadingMoreChats(false)
      }
    },
    [
      currentUserEmail,
      dispatchAction,
      organizationId,
      parsedProfileId,
      parsedUserId,
      profileId,
      searchQuery,
      selectedCustomerId,
      userId,
    ]
  )

  useEffect(() => {
    if (disableChatListFetch) return
    const debounceTimeout = window.setTimeout(() => {
      void fetchChats({
        page: 0,
        search: searchQuery,
      })
    }, 300)

    return () => {
      window.clearTimeout(debounceTimeout)
    }
  }, [disableChatListFetch, fetchChats, searchQuery, selectedCustomerId])

  const fetchChatById = useCallback(
    async (chatId: number) => {
      if (!chatId) return
      const action = await dispatchAction(
        getLabChatById({
          chatId,
          profileId: parsedProfileId || undefined,
          doctorId: parsedUserId || undefined,
          organizationId: parsedOrganizationId || undefined,
        })
      )

      if (!getLabChatById.fulfilled.match(action)) return

      const payload: any = action.payload
      const chatPayload = payload?.chat ?? payload?.data ?? payload
      const mappedThread = mapApiChatToThread(
        chatPayload,
        parsedProfileId,
        parsedUserId,
        currentUserEmail
      )

      setThreads((previousThreads) => {
        const remainingThreads = previousThreads.filter((thread) => thread.id !== mappedThread.id)
        const existingThread = previousThreads.find((thread) => thread.id === mappedThread.id)

        if (!existingThread) {
          return [mappedThread, ...remainingThreads]
        }

        const mergedMessageMap = new Map<string, LabChatMessage>()
        existingThread.messages.forEach((message) => {
          mergedMessageMap.set(message.id, message)
        })
        mappedThread.messages.forEach((message) => {
          mergedMessageMap.set(message.id, message)
        })

        const mergedMessages = sortMessagesChronologically(Array.from(mergedMessageMap.values()))
        const lastMessage = mergedMessages[mergedMessages.length - 1]

        return [
          {
            ...mappedThread,
            messages: mergedMessages,
            lastMessagePreview: lastMessage?.content ?? mappedThread.lastMessagePreview,
          },
          ...remainingThreads,
        ]
      })
      setSelectedThreadId(mappedThread.id)
    },
    [currentUserEmail, dispatchAction, parsedOrganizationId, parsedProfileId, parsedUserId]
  )

  useEffect(() => {
    if (!disableChatListFetch) return
    if (!initialChatId) return
    void fetchChatById(initialChatId)
  }, [disableChatListFetch, fetchChatById, initialChatId])

  const loadMoreChats = useCallback(async () => {
    if (loading || isLoadingMoreChats) return
    if (!hasMoreChats) return

    await fetchChats({
      page: currentChatsPage + 1,
      search: searchQuery,
      append: true,
    })
  }, [currentChatsPage, fetchChats, hasMoreChats, isLoadingMoreChats, loading, searchQuery])

  /**
   * Fetch messages for a specific chat.
   *
   * Design:
   *  1. Dispatch `getLabChatMessages` thunk → returns the API response as `action.payload`.
   *  2. Extract pagination info from the response to track page state.
   *  3. Merge fetched messages into the thread by ID (never replace) so
   *     existing richer payloads (e.g. with attachment data from WebSocket)
   *     are preserved.  This prevents visual flickering.
   *
   * `action.payload` is the single source of truth — the Redux store's
   * `chatMessages` is identical (set in the fulfilled reducer) and must NOT
   * be read here, because putting it in the dependency array would create
   * an infinite fetch → store update → callback recreate → effect re-run loop.
   */
  const fetchMessagesForChat = useCallback(
    async ({
      chatId,
      page = 0,
      appendOlder = false,
    }: {
      chatId: number
      page?: number
      appendOlder?: boolean
    }) => {
      if (!chatId) return
      if (appendOlder && isFetchingMoreMessagesByChatIdRef.current[chatId]) return

      // ── Request dedup: ignore stale responses if a newer request fires ──
      const requestId = (messagesFetchRequestRef.current[chatId] ?? 0) + 1
      messagesFetchRequestRef.current[chatId] = requestId

      // ── Set loading states ──
      if (appendOlder) {
        isFetchingMoreMessagesByChatIdRef.current[chatId] = true
        setIsLoadingMoreMessagesByChatId((prev) => ({...prev, [chatId]: true}))
      } else {
        setIsLoadingMessagesByChatId((prev) => ({...prev, [chatId]: true}))
      }

      try {
        // ── Step 1: Dispatch API call ──
        const action = await dispatchAction(
          getLabChatMessages({
            chatId,
            page,
            size: LAB_CHAT_MESSAGES_PAGE_SIZE,
            profileId: safeParseInt(profileId) || undefined,
          })
        )

        // Drop this response if a newer request was made while we were waiting
        if (messagesFetchRequestRef.current[chatId] !== requestId) return
        if (!getLabChatMessages.fulfilled.match(action)) return

        const responsePayload = action.payload

        // ── Step 2: Extract pagination ──
        const pagination = extractMessagesPagination(responsePayload)
        const resolvedPage = (() => {
          const p = safeParseInt(pagination?.page_number ?? pagination?.pageNumber)
          return p >= 0 ? p : page
        })()
        const hasNextFlag = pagination?.has_next ?? pagination?.hasNext
        const fetchedCount = extractMessageList(responsePayload).length
        const hasMore =
          typeof hasNextFlag === 'boolean'
            ? hasNextFlag
            : fetchedCount >= LAB_CHAT_MESSAGES_PAGE_SIZE

        setMessagesPageByChatId((prev) => ({...prev, [chatId]: resolvedPage}))
        setHasMoreMessagesByChatId((prev) => ({...prev, [chatId]: hasMore}))

        // ── Step 3: Merge into thread (never replace) ──
        setThreads((prevThreads) =>
          prevThreads.map((thread) => {
            if (thread.id !== toThreadId(chatId)) return thread

            const fetchedMessages = mapApiMessagesToThreadMessages(
              responsePayload,
              thread,
              parsedProfileId,
              parsedUserId,
              currentUserEmail
            )

            // Build merged map: existing first, then overlay fetched
            const merged = new Map<string, LabChatMessage>()
            for (const msg of thread.messages) {
              merged.set(msg.id, msg)
            }
            for (const msg of fetchedMessages) {
              const existing = merged.get(msg.id)
              merged.set(
                msg.id,
                existing ? mergeMessagePreferringRicherPayload(existing, msg) : msg
              )
            }

            const messages = sortMessagesChronologically(Array.from(merged.values()))
            const lastMsg = messages[messages.length - 1]

            return {
              ...thread,
              messages,
              lastMessagePreview: lastMsg?.content ?? thread.lastMessagePreview,
              lastUpdated: appendOlder
                ? thread.lastUpdated
                : toRelativeTimeLabel(
                    (responsePayload as any)?.messages?.[0]?.created_at ??
                      (responsePayload as any)?.last_message_at ??
                      (responsePayload as any)?.updated_at ??
                      (responsePayload as any)?.timestamp
                  ),
            }
          })
        )
      } finally {
        // ── Clear loading states ──
        if (appendOlder) {
          isFetchingMoreMessagesByChatIdRef.current[chatId] = false
          setIsLoadingMoreMessagesByChatId((prev) => ({...prev, [chatId]: false}))
          return
        }
        setHasFetchedMessagesByChatId((prev) => ({...prev, [chatId]: true}))
        setIsLoadingMessagesByChatId((prev) => ({...prev, [chatId]: false}))
      }
    },
    [currentUserEmail, dispatchAction, parsedProfileId, parsedUserId, profileId]
  )

  // Keep a ref to the latest fetchMessagesForChat so the auto-fetch effect
  // does NOT re-run every time the callback reference changes.  The effect
  // should fire only when the selected thread or user context changes.
  const fetchMessagesForChatRef = useRef(fetchMessagesForChat)
  fetchMessagesForChatRef.current = fetchMessagesForChat

  useEffect(() => {
    if (!selectedThreadId) return
    if (!parsedProfileId || !parsedUserId || !parsedOrganizationId) return

    const chatId = resolveChatIdFromThreadId(selectedThreadId)
    if (!chatId) return

    void fetchMessagesForChatRef.current({chatId, page: 0, appendOlder: false})
  }, [parsedOrganizationId, parsedProfileId, parsedUserId, selectedThreadId])

  const loadOlderMessagesForSelectedChat = useCallback(async () => {
    if (!selectedThreadChatId) return
    if (messagesLoading) return
    if (isLoadingMoreMessagesByChatId[selectedThreadChatId]) return
    if (hasMoreMessagesByChatId[selectedThreadChatId] === false) return

    const nextPage = (messagesPageByChatId[selectedThreadChatId] ?? 0) + 1
    await fetchMessagesForChat({
      chatId: selectedThreadChatId,
      page: nextPage,
      appendOlder: true,
    })
  }, [
    fetchMessagesForChat,
    hasMoreMessagesByChatId,
    isLoadingMoreMessagesByChatId,
    messagesLoading,
    messagesPageByChatId,
    selectedThreadChatId,
  ])

  useEffect(() => {
    if (!selectedThreadId) return
    const thread = threads.find((item) => item.id === selectedThreadId)
    if (!thread) return
    if (!shouldFetchLatestAlignerCheckInForThread(thread)) return
    const patientId = resolvePatientIdFromThread(thread)
    if (!patientId) return
    if (latestAlignerProgressByPatientId[patientId]) return
    if (fetchedAlignerCheckInPatientIdsRef.current.has(patientId)) return
    void fetchLatestAlignerCheckInForPatient(patientId)
  }, [
    selectedThreadId,
    threads,
    latestAlignerProgressByPatientId,
    fetchLatestAlignerCheckInForPatient,
  ])

  const selectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId)
  }, [])

  const setSelectedCustomerFilter = useCallback((customerId: number | null) => {
    setSelectedCustomerId(customerId)
  }, [])

  const loadSelectedThreadGroupInfo = useCallback(
    async (force = false) => {
      if (!selectedThreadChatId) return
      if (!force && groupInfoByChatId[selectedThreadChatId]) return

      setGroupInfoLoadingByChatId((previous) => ({
        ...previous,
        [selectedThreadChatId]: true,
      }))
      setGroupInfoErrorByChatId((previous) => ({
        ...previous,
        [selectedThreadChatId]: null,
      }))

      const action = await dispatchAction(
        getLabChatById({
          chatId: selectedThreadChatId,
          profileId: parsedProfileId || undefined,
          doctorId: parsedUserId || undefined,
          organizationId: parsedOrganizationId || undefined,
        })
      )

      if (getLabChatById.fulfilled.match(action)) {
        setGroupInfoByChatId((previous) => ({
          ...previous,
          [selectedThreadChatId]: action.payload as LabChatByIdResponse,
        }))
      } else {
        setGroupInfoErrorByChatId((previous) => ({
          ...previous,
          [selectedThreadChatId]: toGroupInfoErrorMessage(action.payload ?? action.error?.message),
        }))
      }

      setGroupInfoLoadingByChatId((previous) => ({
        ...previous,
        [selectedThreadChatId]: false,
      }))
    },
    [
      dispatchAction,
      groupInfoByChatId,
      parsedOrganizationId,
      parsedProfileId,
      parsedUserId,
      selectedThreadChatId,
    ]
  )

  const retrySelectedThreadGroupInfo = useCallback(async () => {
    await loadSelectedThreadGroupInfo(true)
  }, [loadSelectedThreadGroupInfo])

  const assignCaseTeamToSelectedChat = useCallback(
    async (caseTeamId: number | string) => {
      if (!selectedThreadChatId) return false

      setAssignCaseTeamLoading(true)
      setAssignCaseTeamError(null)

      const action = await dispatchAction(
        addLabChatParticipants({
          chatId: selectedThreadChatId,
          caseTeamIds: [caseTeamId],
          profileId: parsedProfileId || undefined,
          doctorId: parsedUserId || undefined,
          organizationId: parsedOrganizationId || undefined,
        })
      )

      if (addLabChatParticipants.fulfilled.match(action)) {
        setGroupInfoByChatId((previous) => ({
          ...previous,
          [selectedThreadChatId]: action.payload as LabChatByIdResponse,
        }))
        setGroupInfoErrorByChatId((previous) => ({
          ...previous,
          [selectedThreadChatId]: null,
        }))
        setAssignCaseTeamLoading(false)
        return true
      }

      const errorMessage = toGroupInfoErrorMessage(action.payload ?? action.error?.message)
      setAssignCaseTeamError(errorMessage)
      setGroupInfoErrorByChatId((previous) => ({
        ...previous,
        [selectedThreadChatId]: errorMessage,
      }))
      setAssignCaseTeamLoading(false)
      return false
    },
    [dispatchAction, parsedOrganizationId, parsedProfileId, parsedUserId, selectedThreadChatId]
  )

  const upsertSelectedThread = useCallback((nextThread: LabChatThread) => {
    setThreads((previousThreads) => {
      const remainingThreads = previousThreads.filter((thread) => thread.id !== nextThread.id)
      return [nextThread, ...remainingThreads]
    })
  }, [])

  const createChatForPatient = useCallback(
    async (patientId: number, patientName: string) => {
      if (!patientId) return false

      const action = await dispatchAction(
        createLabChat({
          patientId,
          chatName: patientName,
          description: '',
          profileId: safeParseInt(profileId) || undefined,
        })
      )
      if (!createLabChat.fulfilled.match(action)) return false

      const createdChatId = safeParseInt(
        action.payload?.id ?? action.payload?.chat_id ?? action.payload?.chatId
      )
      await fetchChats({
        page: 0,
        preferredThreadId: createdChatId ? toThreadId(createdChatId) : undefined,
        search: searchQuery,
      })
      return true
    },
    [dispatchAction, fetchChats, profileId, searchQuery]
  )

  const createAlignerCheckInForSelectedChat = useCallback(
    async (payload: QuickCheckInData) => {
      if (!selectedThread) return false

      const chatId = resolveChatIdFromThreadId(selectedThread.id)
      const patientId = resolvePatientIdFromThread(selectedThread)
      const alignerNumber = safeParseInt(payload.alignerNumber)

      if (!chatId || !patientId || !alignerNumber) return false

      const action = await dispatchAction(
        createLabAlignerCheckIn({
          chat_id: chatId,
          patient_id: patientId,
          aligner_number: alignerNumber,
          start_aligner_number: payload.startAlignerNumber,
          end_aligner_number: payload.endAlignerNumber,
          total_aligners: payload.totalAligners,
          notes: payload.notes,
          profile_id: safeParseInt(profileId) || undefined,
          files: payload.files ?? [],
        })
      )
      if (!createLabAlignerCheckIn.fulfilled.match(action)) return false

      await fetchMessagesForChat({
        chatId,
        page: 0,
        appendOlder: false,
      })
      await fetchLatestAlignerCheckInForPatient(patientId, true)
      return true
    },
    [
      dispatchAction,
      fetchMessagesForChat,
      fetchLatestAlignerCheckInForPatient,
      profileId,
      selectedThread,
    ]
  )

  const selectedThreadProgress: LabChatProgress | null = useMemo(() => {
    if (!selectedThread) return null
    const selectedPatientId = resolvePatientIdFromThread(selectedThread)
    if (!selectedPatientId) return null
    return latestAlignerProgressByPatientId[selectedPatientId] ?? null
  }, [selectedThread, latestAlignerProgressByPatientId])

  /**
   * Handle incoming WebSocket message events (NEW_MESSAGE / MESSAGE_EDITED / MESSAGE_DELETED).
   *
   * The WebSocket delivers the full message payload.  We map it into our
   * internal LabChatMessage format and insert / update / remove it in the
   * thread state.  Deduplication by message ID ensures that messages arriving
   * through both /user/queue/messages AND /topic/chat/{chatId} only appear once.
   */
  const handleWebSocketMessage = useCallback(
    (event: any) => {
      const eventType = String(event?.eventType ?? event?.event_type ?? '').toUpperCase()
      const chatId = safeParseInt(
        event?.chatId ?? event?.chat_id ?? event?.message?.chatId ?? event?.message?.chat_id
      )
      if (!chatId || !eventType) return

      if (eventType === 'NEW_MESSAGE') {
        setThreads((previousThreads) =>
          previousThreads.map((thread) => {
            if (thread.id !== toThreadId(chatId)) return thread

            const incomingPayload = pickIncomingMessagePayload(event)

            const mappedMessages = mapApiMessagesToThreadMessages(
              [incomingPayload],
              thread,
              parsedProfileId,
              parsedUserId,
              currentUserEmail
            )
            const newMessage = mappedMessages[0]
            if (!newMessage) return thread

            const messagesWithoutOptimistic = (() => {
              if (!newMessage.isOwnMessage) return thread.messages

              let hasRemovedMatch = false
              return thread.messages.filter((message) => {
                const isOptimistic = String(message.id).startsWith('optimistic-')
                const isSamePayload =
                  message.isOwnMessage &&
                  message.type === newMessage.type &&
                  String(message.content ?? '') === String(newMessage.content ?? '')
                if (isOptimistic && isSamePayload && !hasRemovedMatch) {
                  hasRemovedMatch = true
                  return false
                }
                return true
              })
            })()

            // Deduplicate by message ID — if the message already exists, skip
            if (messagesWithoutOptimistic.some((m) => m.id === newMessage.id)) {
              return {
                ...thread,
                messages: messagesWithoutOptimistic.map((message) =>
                  message.id === newMessage.id
                    ? mergeMessagePreferringRicherPayload(message, newMessage)
                    : message
                ),
              }
            }

            return {
              ...thread,
              messages: [...messagesWithoutOptimistic, newMessage],
              lastMessagePreview: newMessage.content || thread.lastMessagePreview,
              lastUpdated: 'Just now',
              unreadCount: newMessage.isOwnMessage ? thread.unreadCount : thread.unreadCount + 1,
            }
          })
        )
      } else if (eventType === 'MESSAGE_EDITED') {
        const messageId = String(event?.messageId ?? event?.message_id ?? event?.id ?? '')
        setThreads((previousThreads) =>
          previousThreads.map((thread) => {
            if (thread.id !== toThreadId(chatId)) return thread
            const newContent =
              event?.editedContent ??
              event?.edited_content ??
              event?.textContent ??
              event?.text_content ??
              event?.content
            return {
              ...thread,
              messages: thread.messages.map((m) =>
                m.id === messageId ? {...m, content: String(newContent ?? '')} : m
              ),
            }
          })
        )
      } else if (eventType === 'MESSAGE_DELETED') {
        const messageId = String(event?.messageId ?? event?.message_id ?? event?.id ?? '')
        setThreads((previousThreads) =>
          previousThreads.map((thread) => {
            if (thread.id !== toThreadId(chatId)) return thread
            return {
              ...thread,
              messages: thread.messages.filter((m) => m.id !== messageId),
            }
          })
        )
      }
    },
    [parsedProfileId, parsedUserId, currentUserEmail]
  )

  /**
   * On WebSocket reconnect, re-fetch messages for the active chat to fill
   * any gap that occurred while disconnected.
   */
  const handleWebSocketReconnect = useCallback(() => {
    if (selectedThreadChatId) {
      fetchMessagesForChat({chatId: selectedThreadChatId})
    }
  }, [selectedThreadChatId, fetchMessagesForChat])

  const handleWebSocketTyping = useCallback((event: any) => {
    const chatId = safeParseInt(event?.chatId ?? event?.chat_id)
    if (!chatId) return
    const userName = event?.userName ?? event?.user_name ?? 'Someone'
    const isTyping = !!(event?.isTyping ?? event?.is_typing)

    setTypingUsers((previous) => {
      const currentTyping = previous[chatId] || []
      if (isTyping) {
        if (currentTyping.includes(userName)) return previous
        return {...previous, [chatId]: [...currentTyping, userName]}
      } else {
        return {...previous, [chatId]: currentTyping.filter((name) => name !== userName)}
      }
    })
  }, [])

  const handleWebSocketReadReceipt = useCallback(
    (event: any) => {
      const chatId = safeParseInt(event?.chatId ?? event?.chat_id)
      if (!chatId) return
      const readByProfileId = safeParseInt(
        event?.readByProfileId ??
          event?.read_by_profile_id ??
          event?.readerProfileId ??
          event?.reader_profile_id
      )

      setThreads((previousThreads) =>
        previousThreads.map((thread) => {
          if (thread.id !== toThreadId(chatId)) return thread
          return {
            ...thread,
            unreadCount: readByProfileId === parsedProfileId ? 0 : thread.unreadCount,
          }
        })
      )
    },
    [parsedProfileId]
  )

  // Stable no-op callbacks to avoid creating new references every render.
  // The new useLabChatWebSocket hook uses refs internally so this is
  // belt-and-suspenders – but good practice regardless.
  const noop = useCallback(() => {}, [])

  const {publishTyping, publishReadReceipt, isConnected} = useLabChatWebSocket({
    url: `${process.env.REACT_APP_BASE_APP_PATIENT_URL}/ws-chat`,
    chatId: selectedThreadChatId,
    onMessage: handleWebSocketMessage,
    onTyping: handleWebSocketTyping,
    onReadReceipt: handleWebSocketReadReceipt,
    onReconnect: handleWebSocketReconnect,
    onPresence: noop,
    onError: noop,
  })

  const markMessagesRead = useCallback(
    (messageIds: string[]) => {
      if (!selectedThreadChatId || !parsedProfileId || !userDetail) return
      publishReadReceipt(messageIds, parsedProfileId, userDetail.first_name || 'Practice')

      // Update local state immediately
      setThreads((prev) => {
        let unreadCountToDecrement = 0
        const mapped = prev.map((t) => {
          if (t.id === toThreadId(selectedThreadChatId)) {
            unreadCountToDecrement = t.unreadCount
            return {...t, unreadCount: 0}
          }
          return t
        })
        if (unreadCountToDecrement > 0) {
          setTimeout(() => {
            dispatchAction(updateLabChatUnreadCount(-unreadCountToDecrement))
          }, 0)
        }
        return mapped
      })
    },
    [selectedThreadChatId, parsedProfileId, userDetail, publishReadReceipt, dispatchAction]
  )

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!parsedProfileId || !userDetail) return
      publishTyping(isTyping, parsedProfileId, (userDetail as any).first_name || 'Practice')
    },
    [parsedProfileId, userDetail, publishTyping]
  )

  const sendMessageForSelectedChat = useCallback(
    async (payload: ComposeMessagePayload) => {
      if (!selectedThread) return false

      const chatId = resolveChatIdFromThreadId(selectedThread.id)
      const patientId = resolvePatientIdFromThread(selectedThread)
      if (!chatId || !patientId) return false

      const normalizedContent = String(payload.content ?? '').trim()
      const hasFiles = Array.isArray(payload.files) && payload.files.length > 0

      const messageType =
        payload.type === 'voice' ? 'VOICE_NOTE' : hasFiles ? 'TEXT_WITH_ATTACHMENTS' : 'TEXT'
      const action = await dispatchAction(
        sendLabChatMessage({
          chatId,
          patientId,
          textContent: normalizedContent,
          messageType,
          profileId: safeParseInt(profileId) || undefined,
          files: payload.files ?? [],
        })
      )
      if (sendLabChatMessage.fulfilled.match(action)) {
        setThreads((previousThreads) =>
          previousThreads.map((thread) => {
            if (thread.id !== selectedThread.id) return thread
            const mappedMessages = mapApiMessagesToThreadMessages(
              [action.payload],
              thread,
              parsedProfileId,
              parsedUserId,
              currentUserEmail
            )
            const newMessage = mappedMessages[0]
            if (!newMessage) return thread

            // Avoid duplicate messages if WebSocket event already arrived
            if (thread.messages.some((m) => m.id === newMessage.id)) {
              return {
                ...thread,
                lastMessagePreview: newMessage.content || thread.lastMessagePreview,
                lastUpdated: 'Just now',
              }
            }

            return {
              ...thread,
              messages: [...thread.messages, newMessage],
              lastMessagePreview: newMessage.content || thread.lastMessagePreview,
              lastUpdated: 'Just now',
            }
          })
        )

        return true
      }

      return false
    },
    [currentUserEmail, dispatchAction, parsedProfileId, parsedUserId, profileId, selectedThread]
  )

  return {
    threads,
    selectedThreadId,
    selectedThread,
    selectedCustomerId,
    searchQuery,
    selectThread,
    setSelectedCustomerFilter,
    setSearchQuery,
    loadMoreChats,
    hasMoreChats,
    isLoadingMoreChats,
    loadOlderMessagesForSelectedChat,
    hasMoreMessagesForSelectedChat: selectedThreadChatId
      ? hasMoreMessagesByChatId[selectedThreadChatId] !== false
      : false,
    isLoadingMoreMessagesForSelectedChat: selectedThreadChatId
      ? !!isLoadingMoreMessagesByChatId[selectedThreadChatId]
      : false,
    hasFetchedMessagesForSelectedChat: selectedThreadChatId
      ? !!hasFetchedMessagesByChatId[selectedThreadChatId]
      : false,
    isLoadingMessagesForSelectedChat: selectedThreadChatId
      ? !!isLoadingMessagesByChatId[selectedThreadChatId]
      : false,
    createChatForPatient,
    sendMessageForSelectedChat,
    createAlignerCheckInForSelectedChat,
    selectedThreadProgress,
    latestAlignerNumberByPatientId: useMemo(() => {
      const map: Record<number, number> = {}
      Object.entries(latestAlignerProgressByPatientId).forEach(([id, progress]) => {
        map[Number(id)] = progress.alignerNumber
      })
      return map
    }, [latestAlignerProgressByPatientId]),
    loadSelectedThreadGroupInfo,
    retrySelectedThreadGroupInfo,
    assignCaseTeamToSelectedChat,
    selectedThreadGroupInfo: selectedThreadChatId ? groupInfoByChatId[selectedThreadChatId] : null,
    selectedThreadGroupInfoLoading: selectedThreadChatId
      ? !!groupInfoLoadingByChatId[selectedThreadChatId]
      : false,
    selectedThreadGroupInfoError: selectedThreadChatId
      ? groupInfoErrorByChatId[selectedThreadChatId]
      : null,
    assignCaseTeamLoading,
    assignCaseTeamError,
    upsertSelectedThread,
    isCreatingChat: createLoading,
    isSendingMessage: sendLoading,
    isLoadingMessages: loading || messagesLoading || sendLoading || createAlignerCheckInLoading,
    isCheckInInProgress: createAlignerCheckInLoading,
    messagesError:
      (sendError ?? createAlignerCheckInError ?? messagesError ?? error)
        ? String(sendError ?? createAlignerCheckInError ?? messagesError ?? error)
        : null,
    typingUsers: selectedThreadChatId ? typingUsers[selectedThreadChatId] || [] : [],
    sendTypingStatus,
    markMessagesRead,
    isWebSocketConnected: isConnected,
  }
}
