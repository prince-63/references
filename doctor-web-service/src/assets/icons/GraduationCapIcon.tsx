import React from 'react'
import {IconProps} from '../../types/IconProps'
const GraduationCapIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_1008_8695)'>
        <path
          d='M0.75 9L12 3L23.25 9L12 15L0.75 9Z'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M12 9L17.25 11.8003V22.5'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M20.25 10.6006V15.59C20.2504 15.7732 20.1837 15.9503 20.0625 16.0878C19.0031 17.2681 16.4156 19.5003 12 19.5003C7.58438 19.5003 4.99875 17.2681 3.9375 16.0878C3.81628 15.9503 3.74958 15.7732 3.75 15.59V10.6006'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1008_8695'>
          <rect width={width || '24'} height={height || '24'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default GraduationCapIcon
