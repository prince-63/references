import ArrowRight from 'assets/icons/ArrowRight'
import clsx from 'clsx'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import {useState} from 'react'
import getColorPalette from 'utils/getColorPalette'

interface ActionCardProps {
  onClick?: () => void
  Icon: any
  title: string
  text: string
  disabled?: boolean
}

const ActionCard = ({onClick, Icon, title, text, disabled}: ActionCardProps) => {
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false)
  return (
    <div
      onMouseOver={() => setIsHighlighted(true)}
      onMouseOut={() => setIsHighlighted(false)}
      className={clsx(
        'w-full col-span-1 flex flex-col gap-2 p-4 border border-mediumGray rounded-lg cursor-pointer',
        !disabled && isHighlighted && '!border-primaryColor !bg-primarySupport text-primaryColor',
        disabled && '!cursor-auto pointer-events-none border-lightGray '
      )}
      onClick={onClick}
    >
      <div className='flex flex-row md:items-center items-start md:justify-between gap-3'>
        <div className={clsx(disabled && 'opacity-50')}>
          <Icon color={!disabled && isHighlighted ? getColorPalette().primaryColor : '#000000'} />
        </div>
        <When isTrue={!disabled && isHighlighted}>
          <div className='flex items-center gap-1'>
            <span className='font-medium'>View</span>
            <ArrowRight width='12' color={getColorPalette().primaryColor} />
          </div>
        </When>
        <When isTrue={title === 'Complete treatment'}>
          <Tag
            value='Coming soon'
            className='bg-primarySupport text-primaryColor py-1 px-[6px] rounded text-xs font-medium'
          />
        </When>
        <div className={clsx('text-lg font-semibold md:hidden', disabled && 'opacity-50')}>
          {title}
        </div>
      </div>
      <div className={clsx('text-lg font-semibold hide-on-mobile', disabled && 'opacity-50')}>
        {title}
      </div>
      <div className={clsx('text-textColor', disabled && 'opacity-50')}>{text}</div>
    </div>
  )
}

export default ActionCard
