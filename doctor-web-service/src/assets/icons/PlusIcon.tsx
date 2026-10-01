import React from 'react'
import {IconProps} from '../../types/IconProps'

const PlusIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '16'}
      height={height || '16'}
      viewBox='0 0 16 16'
      fill='none'
    >
      <g path='url(#clip0_5459_4021)'>
        <path
          d='M2.5 8H13.5'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8 2.5V13.5'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_5459_4021'>
          <rect width={width || '16'} height={height || '16'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default PlusIcon
