import {KeyboardEvent, ChangeEvent, useEffect, useMemo, useRef, useState} from 'react'
import {Camera, Loader2, Mic, Paperclip, Send, Video, X} from 'lucide-react'
import {FileOutlined} from '@ant-design/icons'
import {Formik, FormikProps} from 'formik'
import {ComposeMessagePayload} from '../types'
import {QuickCheckInData, QuickCheckInModal} from './QuickCheckInModal'
import {Image as DsImage} from 'assets/images/Images/Image'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {Modal} from 'antd'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'

interface ChatInputProps {
  patientId?: number
  onSendMessage: (payload: ComposeMessagePayload) => void
  onQuickCheckInSave: (data: QuickCheckInData) => void
  onSendTypingStatus?: (isTyping: boolean) => void
  /** Compact sidebar mode – smaller input and inline buttons */
  compact?: boolean
  disabled?: boolean
  isSendingMessage?: boolean
}

interface PendingVoiceNote {
  file: File
  previewUrl: string
}

interface PendingAttachment {
  file: File
  previewUrl: string
  type: 'image' | 'pdf' | 'video'
}

interface ChatInputFormValues {
  message: string
}

const MAX_CHAT_ATTACHMENTS = 15

/**
 * Convert recorded webm audio into a wav-like playable blob.
 * We still name the output file .m4a to match the requested flow,
 * but note this is browser-side decoded/re-encoded PCM packaging,
 * not a true AAC encoder.
 */
const convertWebmToM4A = async (webmBlob: Blob): Promise<Blob> => {
  const AudioCtx =
    window.AudioContext ||
    // @ts-ignore
    window.webkitAudioContext

  if (!AudioCtx) {
    throw new Error('AudioContext is not supported in this browser.')
  }

  const audioContext = new AudioCtx()
  try {
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))

    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )

    const source = offlineCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(offlineCtx.destination)
    source.start(0)

    const renderedBuffer = await offlineCtx.startRendering()

    const numberOfChannels = renderedBuffer.numberOfChannels
    const sampleRate = renderedBuffer.sampleRate
    const length = renderedBuffer.length
    const bytesPerSample = 2
    const blockAlign = numberOfChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = length * blockAlign
    const buffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(buffer)

    let offset = 0

    const writeString = (value: string) => {
      for (let i = 0; i < value.length; i += 1) {
        view.setUint8(offset, value.charCodeAt(i))
        offset += 1
      }
    }

    const writeUint16 = (value: number) => {
      view.setUint16(offset, value, true)
      offset += 2
    }

    const writeUint32 = (value: number) => {
      view.setUint32(offset, value, true)
      offset += 4
    }

    writeString('RIFF')
    writeUint32(36 + dataSize)
    writeString('WAVE')
    writeString('fmt ')
    writeUint32(16)
    writeUint16(1)
    writeUint16(numberOfChannels)
    writeUint32(sampleRate)
    writeUint32(byteRate)
    writeUint16(blockAlign)
    writeUint16(16)
    writeString('data')
    writeUint32(dataSize)

    const channelData = Array.from({length: numberOfChannels}, (_, channelIndex) =>
      renderedBuffer.getChannelData(channelIndex)
    )

    for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
      for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
        const sample = Math.max(-1, Math.min(1, channelData[channelIndex][sampleIndex] || 0))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        offset += 2
      }
    }

    // Browser-generated playable audio blob
    return new Blob([buffer], {type: 'audio/mp4'})
  } finally {
    try {
      await audioContext.close()
    } catch {}
  }
}

export const ChatInput = ({
  patientId,
  onSendMessage,
  onQuickCheckInSave,
  onSendTypingStatus,
  compact = false,
  disabled = false,
  isSendingMessage = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [pendingVoiceNote, setPendingVoiceNote] = useState<PendingVoiceNote | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [attachmentLimitError, setAttachmentLimitError] = useState<string | null>(null)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [activeImagePreviewIndex, setActiveImagePreviewIndex] = useState(0)
  const [activePdfPreview, setActivePdfPreview] = useState<PendingAttachment | null>(null)
  const [activeVideoPreview, setActiveVideoPreview] = useState<PendingAttachment | null>(null)
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false)
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formikRef = useRef<FormikProps<ChatInputFormValues> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const pendingAttachmentsRef = useRef<PendingAttachment[]>([])
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const scrollRetryTimersRef = useRef<NodeJS.Timeout[]>([])
  const isAndroid = useMemo(
    () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent),
    []
  )
  const hasTypedText = message.trim().length > 0
  const isVoiceMode = isRecording || !!pendingVoiceNote
  const imagePreviewAttachments = useMemo(
    () => pendingAttachments.filter((attachment) => attachment.type === 'image'),
    [pendingAttachments]
  )

  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  useEffect(() => {
    pendingAttachmentsRef.current = pendingAttachments
  }, [pendingAttachments])

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
      mediaRecorderRef.current = null
      audioChunksRef.current = []
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      scrollRetryTimersRef.current.forEach(clearTimeout)
      scrollRetryTimersRef.current = []
      pendingAttachmentsRef.current.forEach((attachment) =>
        URL.revokeObjectURL(attachment.previewUrl)
      )
    }
  }, [])

  useEffect(() => {
    if (!isImageViewerOpen) return
    if (imagePreviewAttachments.length === 0) {
      setIsImageViewerOpen(false)
      setActiveImagePreviewIndex(0)
      return
    }
    if (activeImagePreviewIndex >= imagePreviewAttachments.length) {
      setActiveImagePreviewIndex(imagePreviewAttachments.length - 1)
    }
  }, [activeImagePreviewIndex, imagePreviewAttachments.length, isImageViewerOpen])

  useEffect(() => {
    return () => {
      if (pendingVoiceNote?.previewUrl) {
        URL.revokeObjectURL(pendingVoiceNote.previewUrl)
      }
    }
  }, [pendingVoiceNote])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    let debounceTimer: NodeJS.Timeout | null = null

    const applyOffset = () => {
      const activeElement = document.activeElement
      const isTextInputFocused =
        activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement

      if (!isTextInputFocused) {
        setKeyboardOffset(0)
        return
      }

      const viewport = window.visualViewport
      if (!viewport) {
        setKeyboardOffset(0)
        return
      }

      const nextOffset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      setKeyboardOffset(nextOffset)

      // On Android, scroll the input container into view after the offset is applied
      if (isAndroid && nextOffset > 0 && inputContainerRef.current) {
        requestAnimationFrame(() => {
          inputContainerRef.current?.scrollIntoView({block: 'end', behavior: 'smooth'})
        })
      }
    }

    const updateKeyboardOffset = () => {
      // On Android, debounce to wait for the keyboard animation to settle
      if (isAndroid) {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(applyOffset, 120)
      } else {
        applyOffset()
      }
    }

    applyOffset()
    window.visualViewport.addEventListener('resize', updateKeyboardOffset)
    window.visualViewport.addEventListener('scroll', updateKeyboardOffset)
    window.addEventListener('resize', updateKeyboardOffset)

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      window.visualViewport?.removeEventListener('resize', updateKeyboardOffset)
      window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset)
      window.removeEventListener('resize', updateKeyboardOffset)
    }
  }, [isAndroid])

  const clearPendingVoiceNote = () => {
    setPendingVoiceNote((previous) => {
      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl)
      }
      return null
    })
  }

  const clearPendingAttachments = () => {
    setPendingAttachments((previous) => {
      previous.forEach((attachment) => URL.revokeObjectURL(attachment.previewUrl))
      return []
    })
    setIsImageViewerOpen(false)
    setActiveImagePreviewIndex(0)
    setActivePdfPreview(null)
    setActiveVideoPreview(null)
    setAttachmentLimitError(null)
  }

  const removePendingAttachment = (fileKey: string) => {
    const activeImagePreviewUrl = isImageViewerOpen
      ? imagePreviewAttachments[activeImagePreviewIndex]?.previewUrl
      : null

    setPendingAttachments((previous) => {
      const nextAttachments: PendingAttachment[] = []
      previous.forEach((attachment) => {
        const currentKey = `${attachment.file.name}-${attachment.file.size}-${attachment.file.lastModified}`
        if (currentKey === fileKey) {
          URL.revokeObjectURL(attachment.previewUrl)
          if (activeImagePreviewUrl && activeImagePreviewUrl === attachment.previewUrl) {
            setIsImageViewerOpen(false)
            setActiveImagePreviewIndex(0)
          }
          if (activePdfPreview?.previewUrl === attachment.previewUrl) {
            setActivePdfPreview(null)
          }
          if (activeVideoPreview?.previewUrl === attachment.previewUrl) {
            setActiveVideoPreview(null)
          }
          return
        }
        nextAttachments.push(attachment)
      })
      return nextAttachments
    })
    setAttachmentLimitError(null)
  }

  const handlePreviewAttachment = (attachment: PendingAttachment) => {
    if (attachment.type === 'pdf') {
      setActivePdfPreview(attachment)
      return
    }
    if (attachment.type === 'video') {
      setActiveVideoPreview(attachment)
      return
    }
    const previewIndex = imagePreviewAttachments.findIndex(
      (item) => item.previewUrl === attachment.previewUrl
    )
    if (previewIndex < 0) return
    setActiveImagePreviewIndex(previewIndex)
    setIsImageViewerOpen(true)
  }

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    const newValue = event.target.value
    setMessage(newValue)

    if (onSendTypingStatus) {
      if (!isTypingRef.current && newValue.trim().length > 0) {
        isTypingRef.current = true
        onSendTypingStatus(true)
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
        onSendTypingStatus(false)
      }, 3000)
    }
  }

  const handleInputFocus = () => {
    // Clear any pending scroll retries from a previous focus
    scrollRetryTimersRef.current.forEach(clearTimeout)
    scrollRetryTimersRef.current = []

    const scrollInputIntoView = () => {
      if (inputContainerRef.current) {
        inputContainerRef.current.scrollIntoView({block: 'end', behavior: 'smooth'})
      } else {
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLTextAreaElement) {
          activeElement.scrollIntoView({block: 'nearest', behavior: 'smooth'})
        }
      }
    }

    requestAnimationFrame(scrollInputIntoView)

    // On Android the keyboard opens slowly; retry scrollIntoView at staggered
    // intervals to keep the input visible throughout the animation.
    if (isAndroid) {
      const retryDelays = [150, 300, 500]
      retryDelays.forEach((delay) => {
        const timer = setTimeout(scrollInputIntoView, delay)
        scrollRetryTimersRef.current.push(timer)
      })
    }
  }

  const handleInputBlur = () => {
    setKeyboardOffset(0)
  }

  const handleSend = () => {
    if (disabled || isSendingMessage) return
    const trimmedMessage = message.trim()
    if (!trimmedMessage && !pendingVoiceNote && pendingAttachments.length === 0) return

    if (onSendTypingStatus && isTypingRef.current) {
      isTypingRef.current = false
      onSendTypingStatus(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }

    if (pendingVoiceNote) {
      onSendMessage({
        content: 'Voice note sent.',
        type: 'voice',
        attachmentName: pendingVoiceNote.file.name,
        attachmentUrl: pendingVoiceNote.previewUrl,
        attachments: [
          {
            name: pendingVoiceNote.file.name,
            url: pendingVoiceNote.previewUrl,
            type: 'voice',
          },
        ],
        files: [pendingVoiceNote.file],
      })
      clearPendingVoiceNote()
      setMessage('')
      formikRef.current?.setFieldValue('message', '')
      return
    }

    if (pendingAttachments.length > 0) {
      const attachmentFiles = pendingAttachments.map((attachment) => attachment.file)
      const isOnlyPdfAttachments = pendingAttachments.every(
        (attachment) => attachment.type === 'pdf'
      )
      const isOnlyImageAttachments = pendingAttachments.every(
        (attachment) => attachment.type === 'image'
      )
      const isOnlyVideoAttachments = pendingAttachments.every(
        (attachment) => attachment.type === 'video'
      )
      const fallbackContent = isOnlyPdfAttachments
        ? 'Shared plan documents.'
        : isOnlyImageAttachments
          ? 'Shared progress images.'
          : isOnlyVideoAttachments
            ? 'Shared videos.'
            : 'Shared attachments.'

      onSendMessage({
        content: trimmedMessage || fallbackContent,
        type: isOnlyPdfAttachments
          ? 'pdf'
          : isOnlyImageAttachments
            ? 'image'
            : isOnlyVideoAttachments
              ? 'video'
              : 'text',
        attachmentName:
          pendingAttachments.length === 1
            ? pendingAttachments[0].file.name
            : `${pendingAttachments.length} attachments`,
        attachmentUrl:
          pendingAttachments.length === 1 ? pendingAttachments[0].previewUrl : undefined,
        attachments: pendingAttachments.map((attachment) => ({
          name: attachment.file.name,
          url: attachment.previewUrl,
          type: attachment.type,
        })),
        files: attachmentFiles,
      })

      clearPendingAttachments()
      setMessage('')
      formikRef.current?.setFieldValue('message', '')
      return
    }

    onSendMessage({
      content: trimmedMessage,
      type: 'text',
    })
    setMessage('')
    formikRef.current?.setFieldValue('message', '')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const files = event.target.files
    if (!files || files.length === 0) return

    const selectedFiles = Array.from(files).filter((file) => {
      const mimeType = file.type.toLowerCase()
      return (
        mimeType.startsWith('image/') ||
        mimeType.startsWith('video/') ||
        mimeType === 'application/pdf'
      )
    })

    if (selectedFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setPendingAttachments((previous) => {
      const existingKeys = new Set(
        previous.map((attachment) => {
          const {file} = attachment
          return `${file.name}-${file.size}-${file.lastModified}`
        })
      )
      const nextAttachments = [...previous]
      let reachedLimit = false

      selectedFiles.forEach((file) => {
        const fileKey = `${file.name}-${file.size}-${file.lastModified}`
        if (existingKeys.has(fileKey)) return
        if (nextAttachments.length >= MAX_CHAT_ATTACHMENTS) {
          reachedLimit = true
          return
        }
        existingKeys.add(fileKey)

        nextAttachments.push({
          file,
          previewUrl: URL.createObjectURL(file),
          type:
            file.type.toLowerCase() === 'application/pdf'
              ? 'pdf'
              : file.type.toLowerCase().startsWith('video/')
                ? 'video'
                : 'image',
        })
      })

      if (reachedLimit) {
        setAttachmentLimitError(`Maximum ${MAX_CHAT_ATTACHMENTS} attachments allowed.`)
      } else {
        setAttachmentLimitError(null)
      }

      return nextAttachments
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleVoiceNote = async () => {
    if (disabled) return

    if (isRecording) {
      mediaRecorderRef.current?.stop()
      return
    }

    if (hasTypedText) return

    if (onSendTypingStatus && isTypingRef.current) {
      isTypingRef.current = false
      onSendTypingStatus(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true})
      const mediaRecorder = new MediaRecorder(stream)
      mediaStreamRef.current = stream
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, {type: mimeType})

        if (audioBlob.size > 0) {
          let finalBlob = audioBlob
          let extension = 'webm'

          try {
            if (mimeType.includes('webm')) {
              finalBlob = await convertWebmToM4A(audioBlob)
              extension = 'm4a'
            } else if (mimeType.includes('ogg')) {
              extension = 'ogg'
            } else if (mimeType.includes('mp4') || mimeType.includes('aac')) {
              extension = 'm4a'
            } else if (mimeType.includes('mpeg')) {
              extension = 'mp3'
            }
          } catch (error) {
            console.error('Voice note conversion failed, falling back to original format.', error)
            finalBlob = audioBlob
            extension = mimeType.includes('ogg') ? 'ogg' : 'webm'
          }

          const fileName = `voice-note-${Date.now()}.${extension}`
          const voiceFile = new File([finalBlob], fileName, {
            type: finalBlob.type || mimeType,
          })
          const previewUrl = URL.createObjectURL(voiceFile)

          setPendingVoiceNote((previous) => {
            if (previous?.previewUrl) {
              URL.revokeObjectURL(previous.previewUrl)
            }
            return {
              file: voiceFile,
              previewUrl,
            }
          })
        }

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
        mediaRecorderRef.current = null
        audioChunksRef.current = []
        setIsRecording(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Unable to record voice note', error)
      setIsRecording(false)
    }
  }

  const handleQuickCheckInSave = (data: QuickCheckInData) => {
    if (disabled) return
    onQuickCheckInSave(data)
    setShowQuickCheckIn(false)
  }

  return (
    <div
      ref={inputContainerRef}
      className='bg-white transition-[margin] duration-200 ease-out'
      style={keyboardOffset > 0 ? {marginBottom: `${keyboardOffset}px`} : undefined}
    >
      <div className={compact ? 'p-2' : 'p-4'}>
        {!isVoiceMode ? (
          <>
            <div className='w-full sticky bottom-0 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-3'>
              {pendingAttachments.length > 0 ? (
                <div className='mb-2 rounded-md border border-gray-200 bg-gray-50 p-2.5'>
                  <div className='mb-2 flex items-center justify-between'>
                    <p className='text-sm font-medium text-gray-800'>
                      {pendingAttachments.length} attachment
                      {pendingAttachments.length > 1 ? 's' : ''} ready
                    </p>
                    <button
                      type='button'
                      onClick={clearPendingAttachments}
                      disabled={disabled}
                      className='text-xs font-medium text-gray-700 hover:underline'
                    >
                      Clear all
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {pendingAttachments.map((attachment) => {
                      const fileKey = `${attachment.file.name}-${attachment.file.size}-${attachment.file.lastModified}`
                      return (
                        <div
                          key={fileKey}
                          className='relative w-20 rounded-md border border-gray-200 bg-white p-2'
                        >
                          <button
                            type='button'
                            onClick={() => removePendingAttachment(fileKey)}
                            disabled={disabled}
                            className='absolute right-1 top-1 rounded p-0.5 text-gray-500 hover:bg-gray-100'
                            aria-label='Remove attachment'
                          >
                            <X className='h-3.5 w-3.5' />
                          </button>
                          <div className='pr-4'>
                            {attachment.type === 'image' ? (
                              <button
                                type='button'
                                onClick={() => handlePreviewAttachment(attachment)}
                                className='block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/40'
                                aria-label={`Preview ${attachment.file.name}`}
                              >
                                <DsImage
                                  src={attachment.previewUrl}
                                  alt={attachment.file.name}
                                  className='mx-auto h-16 w-16 rounded object-cover'
                                  showLoading
                                  size={14}
                                />
                              </button>
                            ) : attachment.type === 'video' ? (
                              <button
                                type='button'
                                onClick={() => handlePreviewAttachment(attachment)}
                                className='mx-auto inline-flex h-16 w-16 items-center justify-center rounded border border-gray-200 bg-white text-primaryColor hover:border-primaryColor/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/40'
                                aria-label={`Preview ${attachment.file.name}`}
                              >
                                <Video className='h-6 w-6' />
                              </button>
                            ) : (
                              <button
                                type='button'
                                onClick={() => handlePreviewAttachment(attachment)}
                                className='mx-auto inline-flex h-16 w-16 items-center justify-center rounded border border-gray-200 bg-white text-primaryColor hover:border-primaryColor/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/40'
                                aria-label={`Preview ${attachment.file.name}`}
                              >
                                <FileOutlined className='text-2xl' />
                              </button>
                            )}
                            <p className='mt-1 truncate text-[10px] leading-3 text-gray-600'>
                              {attachment.file.name}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              <div className='flex items-end gap-2'>
                <Formik
                  innerRef={formikRef}
                  initialValues={{message: ''}}
                  onSubmit={() => undefined}
                >
                  {() => (
                    <FormikInputTextArea
                      name='message'
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder='Type a message'
                      disabled={disabled}
                      autoSize={{minRows: 1, maxRows: 6}}
                      className='text-textColor !w-full !resize-none !border-none !bg-transparent !p-0 text-sm font-normal !outline-none focus:outline-none focus:ring-0'
                    />
                  )}
                </Formik>
                <button
                  type='button'
                  onClick={handleSend}
                  disabled={isSendingMessage || (!hasTypedText && pendingAttachments.length === 0)}
                  className='rounded-md p-1.5 text-primaryColor transition-colors hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSendingMessage ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                  ) : (
                    <Send className='h-5 w-5' />
                  )}
                </button>
              </div>
              {attachmentLimitError ? (
                <p className='mt-2 text-xs text-red-600'>{attachmentLimitError}</p>
              ) : null}
            </div>
          </>
        ) : (
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
            <div className='mb-2 flex items-center justify-between gap-2'>
              <p className='text-sm font-medium text-blue-900'>
                {isRecording ? 'Recording voice note...' : 'Voice note ready to send'}
              </p>
              <button
                type='button'
                onClick={handleSend}
                disabled={disabled || isSendingMessage || !pendingVoiceNote}
                className='rounded-lg bg-primaryColor p-2 text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50'
                aria-label='Send voice note'
              >
                {isSendingMessage ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <Send className='h-5 w-5' />
                )}
              </button>
            </div>
            {pendingVoiceNote ? (
              <audio src={pendingVoiceNote.previewUrl} controls preload='none' className='w-full' />
            ) : (
              <p className='text-xs text-blue-700'>Tap voice note again to stop recording.</p>
            )}
            {pendingVoiceNote ? (
              <button
                type='button'
                onClick={clearPendingVoiceNote}
                disabled={disabled}
                className='mt-2 text-xs font-medium text-blue-700 hover:underline'
              >
                Remove
              </button>
            ) : null}
          </div>
        )}

        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*,video/*,.pdf'
            multiple
            onChange={handleFileUpload}
            className='hidden'
          />
          <When isTrue={!serviceConfig.VSP_PLANNING}>
            <button
              type='button'
              onClick={() => setShowQuickCheckIn(true)}
              className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-50'
              disabled={disabled}
            >
              <Camera className='h-3.5 w-3.5' />
              <span>Check-In</span>
            </button>
          </When>

          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isVoiceMode}
            className='flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-50'
          >
            <Paperclip className='h-3.5 w-3.5' />
            <span>Attach</span>
          </button>
          <button
            type='button'
            onClick={handleVoiceNote}
            disabled={disabled || ((hasTypedText || pendingAttachments.length > 0) && !isVoiceMode)}
            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              isRecording
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Mic className='h-3.5 w-3.5' />
            <span>{isRecording ? 'Stop' : pendingVoiceNote ? 'Re-record' : 'Voice'}</span>
          </button>
        </div>
      </div>

      <QuickCheckInModal
        isOpen={showQuickCheckIn}
        patientId={patientId}
        onClose={() => setShowQuickCheckIn(false)}
        onSave={handleQuickCheckInSave}
      />
      {isImageViewerOpen && imagePreviewAttachments.length > 0 ? (
        <ImageViewer
          selectedImagesList={imagePreviewAttachments.map((attachment) => ({
            src: attachment.previewUrl,
          }))}
          selectedIndex={Math.min(activeImagePreviewIndex, imagePreviewAttachments.length - 1)}
          setIsShowPhotos={(isVisible: boolean) => {
            setIsImageViewerOpen(isVisible)
            if (!isVisible) {
              setActiveImagePreviewIndex(0)
            }
          }}
        />
      ) : null}
      {activePdfPreview ? (
        <PDFWebview
          pdfUrl={activePdfPreview.previewUrl}
          fileName={activePdfPreview.file.name}
          onBack={() => setActivePdfPreview(null)}
        />
      ) : null}
      <Modal
        open={!!activeVideoPreview}
        onCancel={() => setActiveVideoPreview(null)}
        footer={null}
        centered
        width={720}
        destroyOnClose
        title={activeVideoPreview?.file.name ?? 'Video preview'}
      >
        {activeVideoPreview ? (
          <video
            src={activeVideoPreview.previewUrl}
            controls
            className='w-full max-h-[70vh] rounded-lg bg-black'
          />
        ) : null}
      </Modal>
    </div>
  )
}
