import {type ChangeEvent, useEffect, useMemo, useRef, useState} from 'react'
import {FileText, Image as ImageIcon, Mic, Pause, Play, Video} from 'lucide-react'
import {FileOutlined} from '@ant-design/icons'
import {Image as DsImage} from 'assets/images/Images/Image'
import {getImageUrl} from 'utils/ConstFunctions'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {LabChatAttachment, LabChatMessage} from '../types'
import getColorPalette from 'utils/getColorPalette'
import {Modal} from 'antd'

interface MessageBubbleProps {
  message: LabChatMessage
}

const colorPalette = getColorPalette()

const normalizeAttachmentUrl = (url?: string) => (url ? url.replace(/&amp;/g, '&') : '')
const normalizeMessageText = (value?: string | null) => String(value ?? '').replace(/\\n/g, '\n')

const getVoiceSourceCandidates = (url?: string) => {
  const normalizedUrl = normalizeAttachmentUrl(url)
  if (!normalizedUrl) return []
  return [normalizedUrl]
}

const formatVoiceTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const totalSeconds = Math.floor(seconds)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const IMAGE_PATH_HINTS = ['/patient/drive/image/', '/drive/image/']

const getAttachmentTypeFromUrl = (url?: string, fileName?: string): LabChatAttachment['type'] => {
  const normalizedUrl = normalizeAttachmentUrl(url)
  const extension =
    String(normalizedUrl ?? '')
      .split('?')[0]
      .split('#')[0]
      .split('.')
      .pop()
      ?.toLowerCase() ||
    String(fileName ?? '')
      .split('.')
      .pop()
      ?.toLowerCase()

  if (!extension && normalizedUrl) {
    const lowerUrl = normalizedUrl.toLowerCase()
    if (IMAGE_PATH_HINTS.some((hint) => lowerUrl.includes(hint))) return 'image'
  }

  if (!extension) return 'file'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'].includes(extension)) {
    return 'image'
  }
  if (extension === 'pdf') return 'pdf'
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm'].includes(extension)) return 'voice'
  if (['mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi', 'wmv', 'flv', '3gp'].includes(extension)) {
    return 'video'
  }
  return 'file'
}

const getAttachmentTypeFromFileObject = (file: File): LabChatAttachment['type'] => {
  const mimeType = file.type?.toLowerCase() || ''
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'voice'
  return getAttachmentTypeFromUrl(file.name, file.name)
}

const VoiceNotePlayer = ({
  sourceCandidates,
  fallbackUrl,
}: {
  sourceCandidates: string[]
  fallbackUrl: string
}) => {
  const [activeVoiceSourceIndex, setActiveVoiceSourceIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const frameRef = useRef<number | null>(null)

  const stopProgressLoop = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }

  const startProgressLoop = () => {
    stopProgressLoop()
    const tick = () => {
      const audio = audioRef.current
      if (!audio || audio.paused) return
      setCurrentTime(audio.currentTime)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    setActiveVoiceSourceIndex(0)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setLoadError(null)
  }, [sourceCandidates, fallbackUrl])

  useEffect(() => {
    const nextSource = sourceCandidates[activeVoiceSourceIndex]
    if (!nextSource) {
      setLoadError('Unable to load audio.')
      return
    }

    stopProgressLoop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setLoadError(null)

    const audio = new Audio(nextSource)
    audio.preload = 'metadata'
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      startProgressLoop()
    }

    const handlePause = () => {
      setIsPlaying(false)
      stopProgressLoop()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      stopProgressLoop()
      setCurrentTime(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    const handleError = () => {
      stopProgressLoop()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null

      if (activeVoiceSourceIndex < sourceCandidates.length - 1) {
        setActiveVoiceSourceIndex((previousIndex) => previousIndex + 1)
        return
      }

      setLoadError('Unable to play this audio file.')
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      stopProgressLoop()
      audio.pause()
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeAttribute('src')
      audio.load()
      if (audioRef.current === audio) {
        audioRef.current = null
      }
    }
  }, [activeVoiceSourceIndex, sourceCandidates])

  const togglePlay = () => {
    if (!audioRef.current || loadError) return
    if (!audioRef.current.paused) {
      audioRef.current.pause()
      return
    }
    void audioRef.current.play()
  }

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value)
    setCurrentTime(nextTime)
    if (!audioRef.current || loadError) return
    audioRef.current.currentTime = nextTime
  }

  if (loadError) {
    return (
      <div className='space-y-2'>
        <a
          href={fallbackUrl}
          target='_blank'
          rel='noreferrer'
          className='inline-block text-xs font-medium text-blue-700 hover:underline'
        >
          Open audio
        </a>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={togglePlay}
          disabled={!!loadError}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          className='inline-flex h-8 w-8 items-center justify-center rounded border border-blue-200 text-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isPlaying ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
        </button>

        <input
          type='range'
          min={0}
          max={Math.max(duration, 0)}
          step={0.01}
          value={Math.min(currentTime, duration || 0)}
          onChange={handleSeek}
          disabled={!!loadError || duration <= 0}
          className='w-full'
          aria-label='Voice note seek'
        />
      </div>

      <div className='flex items-center justify-between'>
        <span className='text-xs text-blue-800'>{formatVoiceTime(currentTime)}</span>
        <span className='text-xs text-blue-800'>{formatVoiceTime(duration)}</span>
      </div>

      <a
        href={fallbackUrl}
        target='_blank'
        rel='noreferrer'
        className='inline-block text-xs font-medium text-blue-700 hover:underline'
      >
        Open audio
      </a>
    </div>
  )
}

export const MessageBubble = ({message}: MessageBubbleProps) => {
  const isOwnMessage = !!message.isOwnMessage
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [activeImagePreviewIndex, setActiveImagePreviewIndex] = useState(0)
  const [activeImagePreviewSlides, setActiveImagePreviewSlides] = useState<{src: string}[]>([])
  const [activePdfAttachment, setActivePdfAttachment] = useState<LabChatAttachment | null>(null)
  const [activeVideoAttachment, setActiveVideoAttachment] = useState<LabChatAttachment | null>(null)
  const [fileBasedAttachments, setFileBasedAttachments] = useState<LabChatAttachment[]>([])

  useEffect(() => {
    const rawFiles = Array.isArray((message as any)?.files) ? (message as any).files : []
    const createdObjectUrls: string[] = []

    const mappedFiles: LabChatAttachment[] = rawFiles
      .map((item: any) => {
        if (!item) return null

        if (item instanceof File) {
          const objectUrl = URL.createObjectURL(item)
          createdObjectUrls.push(objectUrl)
          return {
            name: item.name,
            url: objectUrl,
            type: getAttachmentTypeFromFileObject(item),
          }
        }

        if (item?.originFileObj instanceof File) {
          const objectUrl = URL.createObjectURL(item.originFileObj)
          createdObjectUrls.push(objectUrl)
          return {
            name: item.name || item.originFileObj.name,
            url: objectUrl,
            type:
              item.type ||
              getAttachmentTypeFromFileObject(item.originFileObj) ||
              getAttachmentTypeFromUrl(item.url, item.name),
          }
        }

        const possibleUrl = normalizeAttachmentUrl(
          item.previewUrl || item.url || item.attachmentUrl || ''
        )

        if (possibleUrl) {
          return {
            name: item.name || item.fileName,
            url: possibleUrl,
            type: item.type || getAttachmentTypeFromUrl(possibleUrl, item.name || item.fileName),
          }
        }

        return null
      })
      .filter(Boolean) as LabChatAttachment[]

    setFileBasedAttachments(mappedFiles)

    return () => {
      createdObjectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [message])

  const normalizedAttachments = useMemo<LabChatAttachment[]>(() => {
    if (Array.isArray(message.attachments) && message.attachments.length > 0) {
      return message.attachments.map((attachment) => ({
        ...attachment,
        type: attachment.type ?? getAttachmentTypeFromUrl(attachment.url, attachment.name),
      }))
    }

    if (fileBasedAttachments.length > 0) {
      return fileBasedAttachments.map((attachment) => ({
        ...attachment,
        type: attachment.type ?? getAttachmentTypeFromUrl(attachment.url, attachment.name),
      }))
    }

    if (message.attachmentUrl || message.attachmentName) {
      return [
        {
          name: message.attachmentName,
          url: message.attachmentUrl,
          type:
            message.type === 'image'
              ? 'image'
              : message.type === 'pdf'
                ? 'pdf'
                : message.type === 'voice'
                  ? 'voice'
                  : message.type === 'video'
                    ? 'video'
                    : getAttachmentTypeFromUrl(message.attachmentUrl, message.attachmentName),
        },
      ]
    }

    return []
  }, [
    fileBasedAttachments,
    message.attachments,
    message.attachmentName,
    message.attachmentUrl,
    message.type,
  ])

  const imageAttachments = normalizedAttachments.filter((attachment) => attachment.type === 'image')
  const pdfAttachments = normalizedAttachments.filter((attachment) => attachment.type === 'pdf')
  const videoAttachments = normalizedAttachments.filter((attachment) => attachment.type === 'video')

  const getPreviewImageUrl = (attachment: LabChatAttachment) =>
    normalizeAttachmentUrl(getImageUrl(attachment) || attachment.url)

  const checkInAttachments = message.alignerCheckIn?.files ?? []

  const getResolvedAttachmentType = (attachment: LabChatAttachment) =>
    attachment.type ?? getAttachmentTypeFromUrl(getPreviewImageUrl(attachment), attachment.name)

  const checkInImageAttachments = checkInAttachments.filter((attachment) => {
    const resolvedType = getResolvedAttachmentType(attachment)
    return resolvedType === 'image'
  })

  const checkInPdfAttachments = checkInAttachments.filter((attachment) => {
    const resolvedType = getResolvedAttachmentType(attachment)
    return resolvedType === 'pdf'
  })

  const checkInOtherAttachments = checkInAttachments.filter((attachment) => {
    const resolvedType = getResolvedAttachmentType(attachment)
    return resolvedType !== 'image' && resolvedType !== 'pdf'
  })

  const voiceAttachmentUrl = useMemo(() => {
    const voiceAttachment = normalizedAttachments.find((attachment) => attachment.type === 'voice')
    if (voiceAttachment?.url) return normalizeAttachmentUrl(voiceAttachment.url)

    if (message.attachmentUrl) return normalizeAttachmentUrl(message.attachmentUrl)

    return ''
  }, [normalizedAttachments, message.attachmentUrl])

  const voiceSourceCandidates = useMemo(() => {
    return getVoiceSourceCandidates(voiceAttachmentUrl)
  }, [voiceAttachmentUrl])

  const formattedMessageContent = normalizeMessageText(message.content)
  const normalizedMessageContent = formattedMessageContent.trim().toLowerCase()

  const autoSummaryTexts = new Set([
    'shared plan documents.',
    'shared plan document.',
    'shared progress images.',
    'shared progress image.',
    'shared videos.',
    'shared video.',
    'shared attachments.',
    'shared attachment.',
  ])

  const hasRenderableAutoSummaryAttachment =
    imageAttachments.length > 0 || pdfAttachments.length > 0 || videoAttachments.length > 0

  const isAutoAttachmentSummary =
    autoSummaryTexts.has(normalizedMessageContent) && hasRenderableAutoSummaryAttachment

  const shouldShowMessageContent =
    formattedMessageContent.trim().length > 0 &&
    !isAutoAttachmentSummary &&
    (message.type === 'text' ||
      message.type === 'video' ||
      imageAttachments.length > 0 ||
      pdfAttachments.length > 0 ||
      videoAttachments.length > 0)

  const openImageGallery = (attachments: LabChatAttachment[], initialIndex: number) => {
    const previewSlides = attachments
      .map((attachment) => ({
        src: getPreviewImageUrl(attachment),
      }))
      .filter((slide) => Boolean(slide.src))

    if (previewSlides.length === 0) return

    const initialPreviewUrl = getPreviewImageUrl(attachments[initialIndex])
    const resolvedIndex = previewSlides.findIndex((slide) => slide.src === initialPreviewUrl)

    setActiveImagePreviewSlides(previewSlides)
    setActiveImagePreviewIndex(
      resolvedIndex >= 0 ? Math.min(Math.max(resolvedIndex, 0), previewSlides.length - 1) : 0
    )
    setIsImageViewerOpen(true)
  }

  const sectionClassName = 'space-y-2 rounded-xl border border-gray-200/90 bg-white p-2.5'
  const sectionLabelClassName = 'text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600'

  const bubbleRadiusClassName = isOwnMessage
    ? 'rounded-[16px] rounded-tr-[4px]'
    : 'rounded-[16px] rounded-tl-[4px]'

  const bubbleStyle = isOwnMessage
    ? {
        backgroundColor: colorPalette.primaryColor,
        borderColor: colorPalette.primaryColor,
      }
    : {
        backgroundColor: colorPalette.white,
        borderColor: colorPalette.lighterGray,
      }

  return (
    <>
      <div className='w-full space-y-1.5 overflow-x-hidden'>
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <div
            className='max-w-[85vw] break-all px-1 text-[10px] font-semibold uppercase tracking-[0.08em]'
            style={{color: colorPalette.textColor}}
          >
            {message.senderName}
          </div>
        </div>

        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[88%] min-w-0 overflow-hidden border px-3.5 py-3 shadow-[0_2px_8px_rgba(16,24,40,0.08)] sm:max-w-2xl ${bubbleRadiusClassName}`}
            style={bubbleStyle}
          >
            <div className='space-y-3'>
              {shouldShowMessageContent ? (
                <p
                  className={`whitespace-pre-wrap break-words text-sm leading-7 ${
                    isOwnMessage ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{overflowWrap: 'anywhere', wordBreak: 'break-word'}}
                >
                  {formattedMessageContent}
                </p>
              ) : null}

              {message.type === 'aligner_check_in' ? (
                <div className='space-y-3'>
                  <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-3'>
                    <p className='text-sm font-semibold text-emerald-900'>Check-in in progress</p>
                    {message.alignerCheckIn?.alignerNumber ? (
                      <p className='mt-1 text-sm text-emerald-900'>
                        Aligner Number:{' '}
                        <span className='font-semibold'>
                          {message.alignerCheckIn.alignerNumber}
                        </span>
                      </p>
                    ) : null}
                    {message.alignerCheckIn?.notes ? (
                      <p
                        className='mt-1 whitespace-pre-wrap break-all text-sm text-emerald-900'
                        style={{overflowWrap: 'anywhere', wordBreak: 'break-word'}}
                      >
                        <span className='font-semibold'>Notes:</span>{' '}
                        {normalizeMessageText(message.alignerCheckIn.notes)}
                      </p>
                    ) : null}
                  </div>

                  {checkInImageAttachments.length > 0 ? (
                    <div className={sectionClassName}>
                      <p className={sectionLabelClassName}>Images</p>
                      <div className='flex flex-wrap gap-2'>
                        {checkInImageAttachments.map((file, index) => {
                          const previewImageUrl = getPreviewImageUrl(file)
                          return (
                            <button
                              key={`${file.url ?? file.name ?? index}-checkin-image`}
                              type='button'
                              onClick={() => openImageGallery(checkInImageAttachments, index)}
                              className='inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-primaryColor/40'
                              aria-label={file.name ?? 'Open check-in image preview'}
                            >
                              {previewImageUrl ? (
                                <DsImage
                                  src={previewImageUrl}
                                  alt={file.name ?? 'Check-in image'}
                                  className='h-full w-full object-cover bg-white'
                                  showLoading
                                  size={24}
                                />
                              ) : (
                                <ImageIcon className='h-4 w-4 text-gray-500' />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

                  {checkInPdfAttachments.length > 0 ? (
                    <div className={sectionClassName}>
                      <p className={sectionLabelClassName}>PDFs</p>
                      <div className='flex flex-wrap gap-2'>
                        {checkInPdfAttachments.map((file, index) => (
                          <button
                            key={`${file.url ?? file.name ?? index}-checkin-pdf`}
                            type='button'
                            onClick={() => (file.url ? setActivePdfAttachment(file) : null)}
                            disabled={!file.url}
                            className='inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-primaryColor hover:border-primaryColor/40 disabled:cursor-default'
                            aria-label={file.name ?? 'Open PDF'}
                          >
                            <FileOutlined className='text-xl' />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {checkInOtherAttachments.length > 0 ? (
                    <div className={sectionClassName}>
                      <p className={sectionLabelClassName}>Files</p>
                      {checkInOtherAttachments.map((file, index) => (
                        <div
                          key={`${file.url ?? file.name ?? index}`}
                          className='flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5'
                        >
                          <FileText className='h-4 w-4 shrink-0 text-gray-500' />
                          {file.url ? (
                            <a
                              href={file.url}
                              target='_blank'
                              rel='noreferrer'
                              className='min-w-0 break-all text-sm text-primaryColor underline-offset-2 hover:underline'
                            >
                              {file.name ?? 'Open file'}
                            </a>
                          ) : (
                            <span className='min-w-0 break-all text-sm text-gray-700'>
                              {file.name ?? 'Attachment'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {message.type !== 'aligner_check_in' && imageAttachments.length > 0 ? (
                <div className={sectionClassName}>
                  <p className={sectionLabelClassName}>Images</p>
                  <div className='flex flex-wrap gap-2'>
                    {imageAttachments.map((attachment, index) => {
                      const previewImageUrl = getPreviewImageUrl(attachment)
                      return (
                        <button
                          key={`${attachment.url ?? attachment.name ?? index}-image`}
                          type='button'
                          onClick={() => openImageGallery(imageAttachments, index)}
                          className='inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-primaryColor/40'
                          aria-label={attachment.name ?? 'Open image preview'}
                        >
                          {previewImageUrl ? (
                            <DsImage
                              src={previewImageUrl}
                              alt={attachment.name ?? 'Shared image'}
                              className='h-full w-full object-cover bg-white'
                              showLoading
                              size={24}
                            />
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center text-[10px] font-medium text-gray-500'>
                              IMG
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {message.type !== 'aligner_check_in' && pdfAttachments.length > 0 ? (
                <div className={sectionClassName}>
                  <p className={sectionLabelClassName}>PDFs</p>
                  <div className='flex flex-wrap gap-2'>
                    {pdfAttachments.map((attachment, index) => (
                      <button
                        key={`${attachment.url ?? attachment.name ?? index}-pdf`}
                        type='button'
                        onClick={() => (attachment.url ? setActivePdfAttachment(attachment) : null)}
                        disabled={!attachment.url}
                        className='inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-primaryColor hover:border-primaryColor/40 disabled:cursor-default'
                        aria-label={attachment.name ?? 'Open PDF'}
                      >
                        <FileOutlined className='text-xl' />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {message.type !== 'aligner_check_in' && videoAttachments.length > 0 ? (
                <div className={sectionClassName}>
                  <p className={sectionLabelClassName}>Videos</p>
                  <div className='flex flex-wrap gap-2'>
                    {videoAttachments.map((attachment, index) => (
                      <button
                        key={`${attachment.url ?? attachment.name ?? index}-video`}
                        type='button'
                        onClick={() =>
                          attachment.url ? setActiveVideoAttachment(attachment) : null
                        }
                        disabled={!attachment.url}
                        className='inline-flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-primaryColor hover:border-primaryColor/40 disabled:cursor-default'
                        aria-label={attachment.name ?? 'Open video'}
                        title={attachment.name ?? ''}
                      >
                        <Video className='h-5 w-5' />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {message.type === 'voice' ? (
                <div className='space-y-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3'>
                  <div className='flex items-center gap-2'>
                    <Mic className='h-4 w-4 text-blue-600' />
                    <span className='text-sm font-semibold text-blue-900'>Voice note</span>
                  </div>

                  {voiceSourceCandidates.length > 0 ? (
                    <div className='overflow-hidden rounded-lg border border-blue-100 bg-white p-2'>
                      <VoiceNotePlayer
                        sourceCandidates={voiceSourceCandidates}
                        fallbackUrl={voiceAttachmentUrl}
                      />
                    </div>
                  ) : voiceAttachmentUrl ? (
                    <div className='space-y-2'>
                      <p className='text-xs text-blue-700'>
                        Unable to play inline. Download or open in a new tab:
                      </p>
                      <a
                        href={voiceAttachmentUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-block text-xs font-medium text-blue-700 hover:underline'
                      >
                        Open audio file
                      </a>
                    </div>
                  ) : (
                    <p
                      className='whitespace-pre-wrap break-words text-sm text-blue-900'
                      style={{overflowWrap: 'anywhere', wordBreak: 'break-word'}}
                    >
                      {formattedMessageContent}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <p className='px-1 text-[11px] font-semibold' style={{color: colorPalette.grayDisabled}}>
            {message.timestamp}
          </p>
        </div>
      </div>

      {activePdfAttachment?.url ? (
        <PDFWebview
          pdfUrl={normalizeAttachmentUrl(activePdfAttachment.url)}
          onBack={() => setActivePdfAttachment(null)}
          fileName={activePdfAttachment.name ?? 'PDF Viewer'}
        />
      ) : null}

      {isImageViewerOpen && activeImagePreviewSlides.length > 0 ? (
        <ImageViewer
          selectedImagesList={activeImagePreviewSlides}
          selectedIndex={Math.min(activeImagePreviewIndex, activeImagePreviewSlides.length - 1)}
          setIsShowPhotos={(isVisible: boolean) => {
            setIsImageViewerOpen(isVisible)
            if (!isVisible) {
              setActiveImagePreviewSlides([])
              setActiveImagePreviewIndex(0)
            }
          }}
        />
      ) : null}

      <Modal
        open={!!activeVideoAttachment?.url}
        onCancel={() => setActiveVideoAttachment(null)}
        footer={null}
        centered
        width={720}
        destroyOnClose
        title={activeVideoAttachment?.name ?? 'Video'}
      >
        {activeVideoAttachment?.url ? (
          <div className='space-y-3'>
            <video
              src={normalizeAttachmentUrl(activeVideoAttachment.url)}
              controls
              className='w-full max-h-[70vh] rounded-lg bg-black'
            />
            <a
              href={normalizeAttachmentUrl(activeVideoAttachment.url)}
              target='_blank'
              rel='noreferrer'
              className='inline-block text-sm font-semibold text-primaryColor hover:underline'
            >
              Open video in new tab
            </a>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
