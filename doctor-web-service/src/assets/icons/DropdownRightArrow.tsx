import React from 'react'
import {IconProps} from '../../types/IconProps'
const DropdownRightArrow = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '12'}
      height={height || '12'}
      viewBox='0 0 12 12'
      fill='none'
    >
      <g clipPath='url(#clip0_9908_6118)'>
        <path
          d='M4.5 2.25L8.25 6L4.5 9.75'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_9908_6118'>
          <rect width={width || '12'} height={height || '12'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}
export default DropdownRightArrow
