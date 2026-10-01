import React from 'react'
import cn from '@utils/cn'
import ColorIcon from 'components/colorIcon/ColorIcon'
import hasValue from 'utils/hasValue'

const StatBox = ({
  count,
  title,
  color,
  onClick,
  className,
}: {
  count: React.ReactNode
  title: string
  color?: string
  onClick?: () => void
  className?: string
}) => {
  return (
    <div
      className={cn(
        'border border-mediumGray rounded-lg px-4 py-3  min-w-40 cursor-pointer flex-shrink flex-grow md:flex-grow-0 bg-[#F5F5F5]',
        className
      )}
      onClick={onClick ? onClick : undefined}
    >
      <div className='flex gap-2 items-center'>
        {color && <ColorIcon {...{color: color}} />}
        <p className='text-sm font-medium text-textColor'>{title}</p>
      </div>
      <p className={cn('text-xl font-semibold', hasValue(color) && 'pl-4')}>{count}</p>
    </div>
  )
}

export default StatBox
