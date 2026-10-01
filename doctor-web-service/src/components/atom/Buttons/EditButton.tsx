import cn from '@utils/cn'
import PencilIconOutline from 'assets/icons/PencilIconOutline'
import When from 'components/when/When'
import React from 'react'

const EditButton = ({
  onClick,
  className,
  show = true,
  children,
  color = '#666666',
}: {
  onClick: () => void
  show?: boolean
  className?: string
  children?: React.ReactNode
  color?: string
}) => {
  return (
    <When isTrue={show}>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={cn(
          'p-1.5 border border-mediumGray rounded-lg hidden group-hover:block bg-white',
          className
        )}
      >
        <PencilIconOutline height='16' width='16' color={color} />
        {children}
      </button>
    </When>
  )
}

export default EditButton
