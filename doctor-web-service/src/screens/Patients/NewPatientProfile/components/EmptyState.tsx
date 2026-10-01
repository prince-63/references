import React from 'react'
import CardHeading from './CardHeading'
import {Image} from 'assets/images/Images/Image'
import {IMAGE_SEARCH_EMPTY_STATE} from 'utils/ImageConst'
import clsx from 'clsx'

const TreatmentEmptyState = ({
  title,
  text,
  showBorder,
  className,
}: {
  title?: string
  text: string
  showBorder?: boolean
  className?: string
}) => {
  return (
    <div className={clsx('p-4 rounded-lg', showBorder && 'border border-lightGray', className)}>
      {title && <CardHeading text={title} />}
      <div className='w-full h-[10rem] text-textColor text-sm font-medium flex flex-col gap-2 items-center justify-center text-center text-wrap'>
        <Image className='' src={IMAGE_SEARCH_EMPTY_STATE} alt='No search results found' />
        <span className='text-center max-w-[30rem]'>{text}</span>
      </div>
    </div>
  )
}

export default TreatmentEmptyState
