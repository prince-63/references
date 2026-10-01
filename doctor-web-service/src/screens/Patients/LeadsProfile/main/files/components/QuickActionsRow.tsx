import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'

const QuickActionsRow = ({
  showDivider,
  icon,
  title,
  onClickAction,
  disabled = false,
  className = 'text-textColor font-medium text-sm',
  width = '18',
  height = '18',
  showArrow = true,
}: {
  showDivider: boolean
  icon: any
  title: string
  onClickAction: () => void
  disabled?: boolean
  className?: string
  width?: string
  height?: string
  showArrow?: boolean
}) => {
  return (
    <div className={` `}>
      <div className='flex flex-col gap-3'>
        <button
          type='button'
          className={clsx(
            'flex items-center justify-between',
            {
              'opacity-50': disabled,
              'opacity-100': !disabled,
              'cursor-not-allowed': disabled,
            },
            className
          )}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onClickAction()
          }}
        >
          <div className='flex gap-2 items-center'>
            <CommonSVG svg={icon} width={width} height={height} />
            {title}
          </div>
          <When isTrue={showArrow}>
            <CommonSVG svg={SVG_EXPAND_RIGHT} width='12' height='12' />
          </When>
        </button>
        <When isTrue={showDivider}>
          <div className='border-t border-mediumGray' />
        </When>
      </div>
    </div>
  )
}

export default QuickActionsRow
