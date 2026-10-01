import React from 'react'
import clsx from 'clsx'

export type StatusType = 'connected' | 'pending' | 'not_connected'

interface FilterBoxProps {
  status: StatusType
  selected?: boolean
  onClick: ({
    page,
    search,
    selectedStatus,
  }: {
    page?: number
    search?: string | null
    selectedStatus: StatusType
  }) => void
}

const statusConfig: Record<
  StatusType,
  {text: string; textColor: string; selectedBg: string; border: string}
> = {
  connected: {
    text: 'Connected',
    textColor: 'text-green-600',
    selectedBg: 'bg-green-50',
    border: 'border-green-600',
  },
  pending: {
    text: 'Pending',
    textColor: 'text-yellow-700',
    selectedBg: 'bg-yellow-50',
    border: 'border-yellow-700',
  },
  not_connected: {
    text: 'Not Connected',
    textColor: 'text-red',
    selectedBg: 'bg-[#fef4f4]',
    border: 'border-red',
  },
}

const FilterBox: React.FC<FilterBoxProps> = ({status, selected = false, onClick}) => {
  const {text, textColor, selectedBg, border} = statusConfig[status]

  return (
    <button
      onClick={() => onClick({selectedStatus: status})}
      className={clsx(
        'flex items-center gap-2 px-4 py-0.5 border rounded-full text-sm font-medium transition-colors duration-200 ',
        selected ? `${selectedBg} border` : 'bg-white',
        textColor,
        border
      )}
    >
      <span className={clsx('text-lg flex-1', textColor)}>●</span>
      <span className='whitespace-nowrap'>{text}</span>
    </button>
  )
}

export default FilterBox
