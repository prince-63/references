import clsx from 'clsx'
import {ReactNode} from 'react'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {iconCross} from 'utils/SvgConstants'

interface ModalLayoutProps {
  children: ReactNode
  className?: string
  isResponsive?: boolean
  title?: React.ReactNode
  footer?: React.ReactNode // 👈 new prop
  onClose?: () => void
}

const ModalLayout = ({
  children,
  className = 'w-[34rem]',
  isResponsive = false,
  title,
  footer,
  onClose,
}: ModalLayoutProps) => {
  const responsiveStyle =
    'md:relative absolute bottom-0 w-full pb-14 md:!pb-6 rounded-t-xl rounded-b-none md:rounded-b-xl'

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 h-full w-full flex justify-center bg-black bg-opacity-40',
        isResponsive ? 'md:!items-center' : '!items-center'
      )}
      style={{zIndex: 9999}}
      tabIndex={-1}
    >
      <div
        className={clsx(
          'bg-white rounded-xl p-6 shadow-l flex flex-col',
          className,
          isResponsive && responsiveStyle,
          !isResponsive && '!relative max-w-[90%]'
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className='flex items-center justify-between mb-4'>
            <div>
              {title &&
                (typeof title === 'string' ? (
                  <h2 className='text-xl font-semibold'>{title}</h2>
                ) : (
                  title
                ))}
            </div>
            {onClose && (
              <CommonSVG
                svg={iconCross}
                width='32'
                height='32'
                onClick={onClose}
                className='cursor-pointer'
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <div className='mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3'>{footer}</div>
        )}
      </div>
    </div>
  )
}

export default ModalLayout
