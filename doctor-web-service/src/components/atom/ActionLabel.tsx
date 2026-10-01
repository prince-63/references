import React from 'react'
import cn from '@utils/cn'

interface ActionLabelProps {
  children: React.ReactNode
  className?: string
}

const ActionLabel: React.FC<ActionLabelProps> = ({children, className}) => {
  return <span className={cn('text-base font-semibold', className)}>{children}</span>
}

export default ActionLabel
