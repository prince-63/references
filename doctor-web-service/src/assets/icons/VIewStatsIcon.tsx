import React from 'react'
import {IconProps} from '../../types/IconProps'

const ViewStatsIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4.5 2H19.5C20.8807 2 22 3.11929 22 4.5V19.5C22 20.8807 20.8807 22 19.5 22H4.5C3.11929 22 2 20.8807 2 19.5V4.5C2 3.11929 3.11929 2 4.5 2Z'
        stroke={color || 'black'}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M7 18.25L7.00024 10.75'
        stroke={color || 'black'}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M12 18.25L12.0002 7'
        stroke={color || 'black'}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M17 18.25L17.0002 14.5'
        stroke={color || 'black'}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  )
}

export default ViewStatsIcon
