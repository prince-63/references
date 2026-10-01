import {ReactNode} from 'react'

export const DrawerTitle = ({title, subTitle}: {title?: ReactNode; subTitle?: React.ReactNode}) => {
  return (
    <div className='flex flex-col p-1 gap-1'>
      <div className='text-2xl text-black font-semibold'>{title}</div>
      <div className='text-textColor text-base font-normal'>{subTitle}</div>
    </div>
  )
}
