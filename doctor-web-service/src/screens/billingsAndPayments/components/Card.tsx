import React from 'react'

const Card = ({children, title}: {children: React.ReactNode; title: React.ReactNode}) => {
  return (
    <div className='rounded-lg min-w-[200px] md:w-full md:px-4 px-2 py-4 border border-mediumGray flex flex-col gap-2 shrink-0 md:shrink'>
      <div className='flex items-center gap-2 text-lg'>
        <p className='font-medium text-textColor text-sm'>{title}</p>
      </div>
      <div className='font-semibold text-xl whitespace-nowrap'>{children}</div>
    </div>
  )
}

export default Card
