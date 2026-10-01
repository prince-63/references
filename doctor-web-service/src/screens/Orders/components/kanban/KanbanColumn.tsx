import React from 'react'
import KanbanCard from './KanbanCard'

type Props = {
  title: string
  orders: any[]
  onCardClick?: (order: any) => void
}

const KanbanColumn: React.FC<Props> = ({title, orders, onCardClick}) => {
  return (
    <div className='min-w-[300px] bg-white border rounded p-3'>
      <div className='font-semibold mb-3'>
        {title} <span className='text-sm text-gray-500'>({orders?.length ?? 0})</span>
      </div>
      <div className='space-y-3'>
        {orders?.map((o) => (
          <KanbanCard key={o.order_id ?? o.id} order={o} onClick={onCardClick} />
        ))}
      </div>
    </div>
  )
}

export default KanbanColumn
