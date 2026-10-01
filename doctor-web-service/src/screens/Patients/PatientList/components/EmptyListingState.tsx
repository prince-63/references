import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import React from 'react'
import {IMAGE_EMPTY_STATE} from 'utils/ImageConst'
interface props {
  title: string
  subTitle: string
  buttonText: string
  onclick: () => void
}
const EmptyListingState = (props: props) => {
  const {title, subTitle, buttonText, onclick} = props
  return (
    <div className='flex justify-center items-center p-5  mt-10'>
      <div className='flex flex-col justify-center text-center'>
        <img src={IMAGE_EMPTY_STATE} className='h-[209px] w-[300px]' />
        <div className='text-[20px] mt-7'>{title}</div>
        <div className='text-[16px] text-textColor mt-4 max-w-[363px]'>{subTitle}</div>
        <div className=' mt-4'>
          <ButtonOutlined onClick={onclick} text={buttonText} />
        </div>
      </div>
    </div>
  )
}

export default EmptyListingState
