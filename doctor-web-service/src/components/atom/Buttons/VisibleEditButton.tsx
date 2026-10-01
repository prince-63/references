import React from 'react'
import PencilIconOutline from 'assets/icons/PencilIconOutline'
import cn from '@utils/cn'

const VisibleEditButton = ({
  onClick,
  className,
  color = '#666666',
}: {
  onClick: () => void
  className?: string
  color?: string
}) => {
  return (
    <button
      type='button'
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 border border-mediumGray rounded-lg bg-white text-sm text-textColor',
        className
      )}
    >
      <PencilIconOutline height='16' width='16' color={color} />
      <span>Edit</span>
    </button>
  )
}

export default VisibleEditButton
