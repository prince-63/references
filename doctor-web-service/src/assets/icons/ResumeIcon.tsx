import React from 'react'
import {IconProps} from '../../types/IconProps'

const ResumeIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 16 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1 1L15 10L1 19V1Z'
        stroke={color || 'black'}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default ResumeIcon
