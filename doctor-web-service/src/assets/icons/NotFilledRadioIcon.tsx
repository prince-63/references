import React from 'react'
import {IconProps} from '../../types/IconProps'

const NotFilledRadioIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_1649_2800)'>
        <path
          d='M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z'
          stroke={color || '666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1649_2800'>
          <rect width={width || '24'} height={height || '24'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default NotFilledRadioIcon
