import React from 'react'
import {IconProps} from '../../types/IconProps'

const PulseIcon = ({color, className}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_4910_4781)'>
        <path
          d='M1.875 10H4.375L7.5 3.125L12.5 16.25L15.625 10H18.125'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_4910_4781'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default PulseIcon
