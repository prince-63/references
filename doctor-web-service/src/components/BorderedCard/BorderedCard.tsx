import When from 'components/when/When'
import React from 'react'
import hasValue from 'utils/hasValue'
import cn from '@utils/cn'

const BorderedCard = ({
  children,
  header,
  className = 'bg-primarySupport text-primaryColor',
  cardClassName,
  contentClassName,
  hide = false,
}: {
  children: React.ReactNode
  header?: {
    title: React.ReactNode
    subTitle?: React.ReactNode
    icon?: number
  }
  className?: string
  cardClassName?: string
  contentClassName?: string
  hide?: boolean
}) => {
  if (hide) return null
  return (
    <div
      className={cn(
        'rounded-lg w-full md:px-4 px-2 py-6 border border-mediumGray flex flex-col gap-5',
        cardClassName
      )}
    >
      <When isTrue={hasValue(header)}>
        <div className='flex items-center gap-2 text-lg'>
          <When isTrue={hasValue(header?.icon)}>
            <div
              className={cn(
                'w-9 h-9 rounded-full flex justify-center items-center font-bold shrink-0',
                className
              )}
            >
              {header?.icon}
            </div>
          </When>
          <div className='w-full'>
            <div className='font-semibold w-full'>{header?.title}</div>
            <p className='text-textColor text-base'>{header?.subTitle}</p>
          </div>
        </div>
      </When>
      <div className={cn(hasValue(header?.icon) && 'pl-[5px]', contentClassName)}>{children}</div>
    </div>
  )
}

export default BorderedCard
