import React from 'react'
import clsx from 'clsx'

type KanbanLayoutProps = {
  header: React.ReactNode
  controls?: React.ReactNode
  content: React.ReactNode
  className?: string
  contentClassName?: string
}

// Provides a consistent shell for kanban/list pages: a top card (header + controls + board/list switch)
// and a body card (main board or table). Ensures uniform padding p-4 md:p-6 and spacing.
const KanbanLayout: React.FC<KanbanLayoutProps> = ({
  header,
  controls,
  content,
  className,
  contentClassName,
}) => {
  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      <div className='bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4'>
        <div>{header}</div>
        {controls && <div className='flex flex-col gap-4 kanban-controls'>{controls}</div>}
      </div>
      <div className={clsx('bg-white rounded-lg p-0 overflow-hidden', contentClassName)}>
        {content}
      </div>
    </div>
  )
}

export default KanbanLayout
