import React from 'react'

type SectionHeaderProps = {
  title: string
  count?: number
  className?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({title, count, className}) => {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium text-textColor ${className ?? ''}`}
    >
      <span className='uppercase'>{title}</span>
      {typeof count === 'number' && (
        <span className='rounded-full bg-white px-2 py-0.5 text-[10px] text-textColor'>
          {count}
        </span>
      )}
    </div>
  )
}

export default SectionHeader
