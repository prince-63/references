import React from 'react'
import {getImageUrl} from 'utils/ConstFunctions'

type Photo = {
  imageUrl: string
  withAligner?: boolean
  jawType?: string
  fileType?: string
}

type Props = {
  title?: string
  trayLabel?: string
  timeLabel?: string
  jawType?: string
  fitFeedback?: {
    upper?: string
    lower?: string
  }
  comfortIssues?: {
    upper?: string[]
    lower?: string[]
    other?: string
  }
  photos?: Photo[]
  onPhotoPress?: (index: number, photos: Photo[]) => void
}

const formatValue = (value: string) => {
  if (!value) return 'Not provided'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const CameraGlyph = ({color = '#94A3B8'}: {color?: string}) => (
  <svg width={22} height={22} viewBox='0 0 24 24' fill='none'>
    <path
      d='M7 7h2l1.2-1.6c.2-.3.6-.4.9-.4h2.9c.3 0 .7.1.9.4L16 7h1c1.7 0 3 1.3 3 3v7c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3v-7c0-1.7 1.3-3 3-3Z'
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin='round'
    />
    <path d='M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' stroke={color} strokeWidth={1.8} />
  </svg>
)

const AlignerReviewCard: React.FC<Props> = ({
  title = 'ALIGNER REVIEW',
  trayLabel = 'Tray #2',
  timeLabel = '06:45 PM',
  jawType = 'UPPER',
  fitFeedback = {},
  comfortIssues = {},
  photos = [],
  onPhotoPress,
}) => {
  const showUpper = jawType === 'UPPER' || jawType === 'BOTH'
  const showLower = jawType === 'LOWER' || jawType === 'BOTH'

  const getComfortText = (issues?: string[], other?: string) => {
    if (issues && issues.length > 0) {
      return issues.map((issue) => formatValue(issue)).join(', ')
    }
    if (other) return other
    return 'No issues reported'
  }

  const upperComfort = getComfortText(comfortIssues.upper, comfortIssues.other)
  const lowerComfort = getComfortText(comfortIssues.lower, comfortIssues.other)

  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.jawType === 'UPPER' && b.jawType === 'LOWER') return -1
    if (a.jawType === 'LOWER' && b.jawType === 'UPPER') return 1
    return 0
  })

  const resolvePhotoUrl = (url?: string) => {
    if (!url) return ''
    if (!url.includes('patient/drive/image/')) return url

    const driveFileId = url.match(/patient\/drive\/image\/([^/?#]+)/)?.[1]

    return (
      getImageUrl({
        url,
        is_gdrive_platform: true,
        drive_file_id: driveFileId,
      }) || url
    )
  }

  return (
    <div className='w-full flex justify-end'>
      <div className='bg-slate-50 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl mr-2 border border-slate-200 p-4 w-full max-w-[340px] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-primaryColor font-extrabold tracking-widest text-sm'>{title}</h3>
          <div className='bg-white border border-slate-200 px-3 py-1.5 rounded-xl'>
            <span className='text-slate-600 font-bold text-sm'>{trayLabel}</span>
          </div>
        </div>

        {/* Photos Section - Horizontally Scrollable */}
        <div className='mb-4 overflow-x-auto overflow-y-hidden scrollbar-hide'>
          <div className='flex flex-row gap-2 w-max'>
            {sortedPhotos.length > 0
              ? sortedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => onPhotoPress?.(index, sortedPhotos)}
                    className='w-24 h-24 min-w-[96px] max-w-[96px] min-h-[96px] max-h-[96px] rounded-2xl bg-slate-200/70 overflow-hidden cursor-pointer flex-shrink-0 relative hover:opacity-90 transition-opacity'
                  >
                    {resolvePhotoUrl(photo.imageUrl) ? (
                      <img
                        src={resolvePhotoUrl(photo.imageUrl)}
                        alt={`chat-review-${index}`}
                        className='w-full h-full object-cover block'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <CameraGlyph />
                      </div>
                    )}
                  </div>
                ))
              : // Show 3 placeholder cameras if no photos
                [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className='w-24 h-24 min-w-[96px] max-w-[96px] min-h-[96px] max-h-[96px] rounded-2xl bg-slate-200/70 flex items-center justify-center flex-shrink-0'
                  >
                    <CameraGlyph />
                  </div>
                ))}
          </div>
        </div>

        {/* Feedback Sections */}
        <div className='mt-2'>
          {/* Upper Fit Feedback */}
          {showUpper && (
            <div className='bg-white rounded-2xl border border-slate-100 p-4 mb-3'>
              <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
                Upper Fit Feedback
              </p>
              <p className='text-black text-sm font-semibold'>
                {formatValue(fitFeedback.upper || 'Not provided')}
              </p>
            </div>
          )}

          {/* Lower Fit Feedback */}
          {showLower && (
            <div className='bg-white rounded-2xl border border-slate-100 p-4 mb-3'>
              <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
                Lower Fit Feedback
              </p>
              <p className='text-black text-sm font-semibold'>
                {formatValue(fitFeedback.lower || 'Not provided')}
              </p>
            </div>
          )}

          {/* Upper Comfort Issues */}
          {showUpper && (
            <div className='bg-white rounded-2xl border border-slate-100 p-4 mb-3'>
              <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
                Upper Comfort Issues
              </p>
              <p className='text-black text-sm font-semibold'>{upperComfort}</p>
            </div>
          )}

          {/* Lower Comfort Issues */}
          {showLower && (
            <div className='bg-white rounded-2xl border border-slate-100 p-4 mb-3'>
              <p className='text-slate-400 font-medium tracking-widest text-xs uppercase mb-1'>
                Lower Comfort Issues
              </p>
              <p className='text-black text-sm font-semibold'>{lowerComfort}</p>
            </div>
          )}

          <p className='text-slate-400 font-bold mt-2 text-right text-sm'>{timeLabel}</p>
        </div>
      </div>
    </div>
  )
}

export default AlignerReviewCard
