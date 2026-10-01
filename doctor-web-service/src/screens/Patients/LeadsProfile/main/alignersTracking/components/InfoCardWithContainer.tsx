import {useState, ReactNode} from 'react'
import cn from '@utils/cn'
import InfoIcon from 'assets/icons/InfoIcon'
import {IoClose} from 'react-icons/io5'
import {IconProps} from 'types/IconProps'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

const InfoCardWithContainer = ({
  title,
  subtitle,
  remarks,

  titleClassName = 'font-semibold',
  className = 'bg-[#F5F4FE]',
  infoIconColor = '#735BF2',

  infoIconClassName = 'items-center',
  Icon = InfoIcon,
  remarksClassName = 'text-xs text-gray-500 mt-3',
  topSectionClassName,
  hideDismissButton = false, // 👈 new prop (default false)
  showRemarksTitle = true,
  primaryButtonText,
  onPrimaryClick,
  primaryButtonClassName = 'bg-primaryColor text-white',
  secondaryButtonText,
  onSecondaryClick,
  secondaryButtonClassName = 'text-primaryColor border border-primaryColor bg-transparent',
  showCaretRightIcon = true,
  truncate = false,
  truncateText,
  truncateWordLimit = 20,
}: {
  title?: string
  subtitle?: ReactNode | string
  remarks?: ReactNode
  showButton?: boolean
  titleClassName?: string
  className?: string
  infoIconColor?: string
  iconColor?: string
  infoIconClassName?: string
  Icon?: React.FC<IconProps>
  remarksClassName?: string
  topSectionClassName?: string
  hideDismissButton?: boolean
  showRemarksTitle?: boolean
  primaryButtonText?: string
  onPrimaryClick?: () => void
  primaryButtonClassName?: string
  secondaryButtonText?: string
  onSecondaryClick?: () => void
  secondaryButtonClassName?: string
  showCaretRightIcon?: boolean
  truncate?: boolean
  truncateText?: string | null
  truncateWordLimit?: number
}) => {
  const [visible, setVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  if (!visible) return null

  const derivedTruncateText = truncateText ?? (typeof remarks === 'string' ? remarks : undefined)
  const wordsCount = (() => {
    if (!derivedTruncateText) return 0
    const trimmed = derivedTruncateText.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).filter((word) => word.length > 0).length
  })()

  const shouldShowTruncateToggle =
    Boolean(truncate && remarks && derivedTruncateText) && wordsCount > truncateWordLimit

  const renderRemarks = () => {
    if (!remarks) return null

    // If remarks is not a string, do default behavior
    if (typeof derivedTruncateText !== 'string' || !shouldShowTruncateToggle) {
      return remarks
    }

    const trimmed = derivedTruncateText.trim()
    const words = trimmed.split(/\s+/)

    const truncatedText = words.slice(0, truncateWordLimit).join(' ')

    return (
      <div className='text-sm text-[#666666] leading-relaxed'>
        {!isExpanded ? (
          <>
            {truncatedText}
            {words.length > truncateWordLimit && '... '}
            <button
              type='button'
              className='text-[#F04438] font-semibold'
              onClick={() => setIsExpanded(true)}
            >
              See more
            </button>
          </>
        ) : (
          <>
            {trimmed}{' '}
            <button
              type='button'
              className='text-[#F04438] font-semibold'
              onClick={() => setIsExpanded(false)}
            >
              See less
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col rounded-lg w-full gap-3', className)}>
      {/* Top Section */}
      <div
        className={cn(
          'flex flex-col p-4 gap-3 md:flex-row md:items-start md:justify-between',
          topSectionClassName
        )}
      >
        <div
          className={cn(
            'flex gap-3 md:!items-center !items-start justify-start',
            infoIconClassName
          )}
        >
          <div className='min-w-7'>
            <Icon color={infoIconColor} height='24' width='24' />
          </div>
          <div>
            <div className={cn('text-primaryColor text-[16px]', titleClassName)}>{title}</div>
            <div className='text-textColor text-[14px]'>{subtitle}</div>
          </div>
        </div>

        <div className='flex flex-col  gap-2 md:items-end'>
          {(secondaryButtonText || primaryButtonText) && (
            <div className='flex  gap-2 justify-end'>
              {secondaryButtonText && (
                <button
                  type='button'
                  onClick={onSecondaryClick}
                  className={cn(
                    'py-2 px-4 rounded-lg font-semibold flex items-center gap-2',
                    secondaryButtonClassName
                  )}
                >
                  <span>{secondaryButtonText}</span>
                  {showCaretRightIcon && <CaretRightIcon color='currentColor' />}
                </button>
              )}
              {primaryButtonText && (
                <button
                  type='button'
                  onClick={onPrimaryClick}
                  className={cn(
                    'py-2 px-4 rounded-lg font-semibold flex items-center gap-2',
                    primaryButtonClassName
                  )}
                >
                  <span>{primaryButtonText}</span>
                  {showCaretRightIcon && <CaretRightIcon color='currentColor' />}
                </button>
              )}
            </div>
          )}

          {!hideDismissButton && (
            <button
              type='button'
              className='flex items-center gap-2 text-[#0095ff] border border-[#0095ff] rounded-md px-3 py-1 hover:bg-[#0095ff]/10 transition'
              onClick={() => setVisible(false)}
            >
              <IoClose size={18} color={'#0095ff'} />
              <span>Dismiss</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Section (Remarks) */}
      <div className='flex flex-col p-2'>
        {showRemarksTitle && <div className='text-textColor font-medium'>Remarks</div>}
        <div className={cn('bg-white rounded-md', remarksClassName)}>{renderRemarks()}</div>
      </div>
    </div>
  )
}

export default InfoCardWithContainer
