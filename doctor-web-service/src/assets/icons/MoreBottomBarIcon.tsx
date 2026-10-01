import React from 'react'
import {IconProps} from '../../types/IconProps'

const MoreBottomBarIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '25'}
      height={height || '24'}
      viewBox='0 0 25 24'
      fill={color || 'none'}
    >
      <g opacity='0.72' clipPath='url(#clip0_13072_257)'>
        <path
          d='M4 12H20.5'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4 6H20.5'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4 18H20.5'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_13072_257'>
          <rect
            width='24'
            height={height || '24'}
            fill={color || 'white'}
            transform='translate(0.25)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default MoreBottomBarIcon
