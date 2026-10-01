import React from 'react'

type StatusPillProps = {
  label: string
  count: number
  onClick?: () => void
}

const StatusPill: React.FC<StatusPillProps> = ({label, count, onClick}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2 text-left text-sm shadow-sm transition hover:shadow'
    >
      <span className='text-gray-700'>{label}</span>
      <span className='rounded-full bg-orangeSupport px-2 py-0.5 text-[11px] font-medium '>
        {count}
      </span>
    </button>
  )
}

export default StatusPill
