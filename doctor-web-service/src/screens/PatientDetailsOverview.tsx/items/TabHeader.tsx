import React from 'react'

const TabHeader = ({title, description}: {title: string; description: string}) => {
  return (
    <div className='space-y-1'>
      <h2 className='text-xl font-semibold md:text-lg'>{title}</h2>
      <div className='text-xs sm:text-sm text-textColor mt-1'>{description}</div>
    </div>
  )
}

export default TabHeader
