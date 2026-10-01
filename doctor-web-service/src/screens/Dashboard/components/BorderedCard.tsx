import cn from '@utils/cn'
import React from 'react'

const BorderedCardForDashBoardCards = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'border border-mediumGray rounded-lg flex-grow md:px-4 px-2 py-4 flex flex-col gap-3 text-textColor text-base h-fit',
        className
      )}
    >
      {children}
    </div>
  )
}

export default BorderedCardForDashBoardCards
