import React from 'react'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import {SVG_ARROW_RIGHT_GRAY} from '../../../../../utils/SvgConstants'

interface StatusOrProductionLabUpdateModalBodyProps {
  changeMessage: string
  newValue: string
}

const StatusOrProductionLabUpdateModalBody = ({
  changeMessage,
  newValue,
}: StatusOrProductionLabUpdateModalBodyProps) => {
  return (
    <div className='flex h-16 gap-8'>
      <div className='flex-1 flex items-center justify-end text-textColor text-s'>
        {changeMessage}
      </div>
      <div className='flex-none flex items-center justify-center '>
        <CommonSVG svg={SVG_ARROW_RIGHT_GRAY} width='24' height='24' />
      </div>
      <div className='flex-1 flex items-center justify-left text-xl font-semibold'>{newValue}</div>
    </div>
  )
}

export default StatusOrProductionLabUpdateModalBody
