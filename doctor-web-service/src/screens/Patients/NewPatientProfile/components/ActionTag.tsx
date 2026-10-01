import React from 'react'
import cn from '@utils/cn'

interface ActionTagProps {
  label: string
  className?: string
  iconClassName?: string
}

const ActionTag: React.FC<ActionTagProps> = ({
  label,
  className = 'bg-primarySupport text-primaryColor',
  iconClassName = 'bg-primaryColor',
}) => {
  if (!label) return null
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded-full text-sm font-semibold',
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', iconClassName)} />
      {label}
    </div>
  )
}

export default ActionTag
