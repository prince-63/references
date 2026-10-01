import React from 'react'
import dayjs from 'dayjs'

type Props = {
  order: any
  onClick?: (order: any) => void
  canMove?: boolean
  isDragging?: boolean
}

const KanbanCard: React.FC<Props> = ({order, onClick}) => {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => onClick && onClick(order)}
      className='bg-white rounded-lg border border-gray-200 p-3 hover:shadow transition-colors cursor-pointer'
    >
      <div className='flex items-center justify-between mb-1'>
        <div className='text-xs text-gray-500 font-mono'>{order?.order_id ?? order?.id}</div>
        <div className='text-xs text-gray-500'>{order?.order_status}</div>
      </div>

      <div className='font-medium text-sm'>{order?.patient_name ?? order?.title ?? 'Untitled'}</div>
      {order?.doctor_name && <div className='text-xs text-gray-600'>{order.doctor_name}</div>}

      {order?.order_creation_date && (
        <div className='text-xs text-gray-500 mt-2'>
          Created {dayjs(order.order_creation_date).format('DD-MMM-YYYY')}
        </div>
      )}
    </div>
  )
}

export default KanbanCard
