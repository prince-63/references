import React from 'react'

type StatCardProps = {
  title: string
  subtitle?: string
  value: number | string
}

const StatCard: React.FC<StatCardProps> = ({title, subtitle, value}) => {
  return (
    <div className='flex-1 rounded-lg bg-[#F5F5F5] p-4 shadow-sm'>
      <div className='text-xs uppercase tracking-wide font-semibold'>{title}</div>
      {subtitle ? <div className='mt-0.5 text-[11px] text-gray-400'>{subtitle}</div> : null}
      <div className='mt-2 text-2xl font-semibold text-gray-900'>{value}</div>
    </div>
  )
}

export default StatCard
