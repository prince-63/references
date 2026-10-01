import React from 'react'

type StatCardProps = {
  title: string
  subtitle?: string
  value: number | string
  showExtraValue?: boolean
  aligner?: number
  braces?: number
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  value,
  showExtraValue = false,
  aligner,
  braces,
}) => {
  return (
    <div className='flex-1 rounded-lg bg-[#F5F5F5] p-4 shadow-sm'>
      <div className='text-xs uppercase tracking-wide font-semibold'>{title}</div>
      {subtitle ? <div className='mt-0.5 text-[11px] text-textColor'>{subtitle}</div> : null}
      <div className='flex gap-3 items-end'>
        <div className='mt-2 text-2xl font-semibold text-gray-900'>{value}</div>
        {showExtraValue && <ExtraValue label='Aligner' value={aligner ?? 0} />}
        {showExtraValue && braces !== undefined && (
          <ExtraValue label='Braces' value={braces ?? 0} />
        )}
      </div>
    </div>
  )
}

export default StatCard

const ExtraValue = ({value, label}: {value: number; label: string}) => {
  return (
    <div className='flex gap-1'>
      <div className='text-[14px] font-medium'>{value}</div>
      <div className='text-[14px] text-textColor font-medium'>{label}</div>
    </div>
  )
}
