import cn from '@utils/cn'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import React from 'react'

const ActionItem = ({
  title,
  subTitle,
  onClick,
  count,
}: {
  title: React.ReactNode
  subTitle?: React.ReactNode
  onClick?: () => void
  count?: number
}) => {
  return (
    <div
      className='flex gap-4 items-center text-textColor justify-between cursor-pointer'
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation()
          onClick()
        }
      }}
    >
      <div className='flex flex-col'>
        <p className='font-semibold text-base text-black'>{title}</p>
        <p className='text-sm '>{subTitle}</p>
      </div>
      <div className='flex gap-4 items-center'>
        <p
          className={cn(
            count && count > 0 && 'bg-orange text-white',
            count === 0 && 'bg-lightGray text-textColor',
            'rounded-[4px] px-1.5 font-semibold'
          )}
        >
          {count}
        </p>
        {onClick && (
          <button
            type='button'
            onClick={(e) => {
              if (onClick) {
                e.stopPropagation()
                onClick()
              }
            }}
          >
            <CaretRightIcon color='#666666' />
          </button>
        )}
      </div>
    </div>
  )
}

export default ActionItem
