import React from 'react'

const Header = ({title, subTitle}: {title: string; subTitle: string}) => {
  return (
    <div className='flex justify-between w-full items-start'>
      <div className='flex flex-col '>
        <p className='font-medium text-base'>{title}</p>
        <p className='text-textColor font-normal text-sm'>{subTitle}</p>
      </div>
    </div>
  )
}

export default Header
