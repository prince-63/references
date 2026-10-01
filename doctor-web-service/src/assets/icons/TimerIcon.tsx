import React from 'react'
import {IconProps} from '../../types/IconProps'

const TimerIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12.0005 22C17.5233 22 22.0005 17.5228 22.0005 12C22.0005 6.47715 17.5233 2 12.0005 2C6.47764 2 2.00049 6.47715 2.00049 12C2.00049 17.5228 6.47764 22 12.0005 22Z'
        stroke={color || '#666666'}
        strokeWidth='1.89474'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 6V12L16 14'
        stroke={color || '#666666'}
        strokeWidth='1.89474'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default TimerIcon
