import React from 'react'

const RenderCell = ({children}: {children: React.ReactNode}) => {
  return <div className='text-base font-normal text-textColor'>{children}</div>
}

export default RenderCell
