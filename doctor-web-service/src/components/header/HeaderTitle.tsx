import React from 'react'

const HeaderTitle = ({title, subTitle}: {title: string; subTitle?: string}) => {
  return (
    <div>
      <p className='font-semibold text-2xl'>{title}</p>
      {subTitle && <p className='text-textColor font-normal text-base'>{subTitle}</p>}
    </div>
  )
}

export default HeaderTitle
