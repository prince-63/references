import React, {useRef, useEffect} from 'react'
import KanbanColumn from './KanbanColumn'

type Column = {title: string; key: string; orders: any[]}

type Props = {
  columns: Column[]
  initialScrollTo?: number
  onCardClick?: (order: any) => void
}

const KanbanBoard: React.FC<Props> = ({columns, initialScrollTo = 0, onCardClick}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const child = container.children[initialScrollTo] as HTMLElement | undefined
    if (child) child.scrollIntoView({behavior: 'smooth', inline: 'start', block: 'nearest'})
  }, [columns, initialScrollTo])

  return (
    <div ref={containerRef} className='flex gap-4 overflow-x-auto pb-4'>
      {columns.map((c) => (
        <KanbanColumn key={c.key} title={c.title} orders={c.orders} onCardClick={onCardClick} />
      ))}
    </div>
  )
}

export default KanbanBoard
