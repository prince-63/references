import CommonSVG from 'components/atom/SVG/CommonSVG'
import React from 'react'
import {SVG_INFO_PRIMARY} from 'utils/SvgConstants'
interface props {
  instruction: string
}
const InstructionBar = (props: props) => {
  const {instruction} = props
  return (
    <div className='w-full flex my-5 px-3.5 py-2.5 bg-primarySupport rounded-lg justify-start items-center gap-2'>
      <div className='min-w-[24px] min-h-[24px]'>
        <CommonSVG svg={SVG_INFO_PRIMARY} width='24' height='24' />
      </div>
      <div className='text-primaryColor text-sm'>{instruction}</div>
    </div>
  )
}

export default InstructionBar
