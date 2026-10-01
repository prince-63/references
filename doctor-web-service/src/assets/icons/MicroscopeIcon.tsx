import React from 'react'
import {IconProps} from '../../types/IconProps'

const MicroscopeIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_1652_2926)'>
        <path
          d='M3 20.25H21'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.75 16.5H12.75'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M12 2.25H7.5C7.08579 2.25 6.75 2.58579 6.75 3V12.75C6.75 13.1642 7.08579 13.5 7.5 13.5H12C12.4142 13.5 12.75 13.1642 12.75 12.75V3C12.75 2.58579 12.4142 2.25 12 2.25Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M12.75 6.75C14.3241 6.75 15.8583 7.24528 17.1353 8.16568C18.4123 9.08609 19.3673 10.385 19.8651 11.8783C20.3629 13.3716 20.3782 14.9837 19.9089 16.4863C19.4395 17.9888 18.5093 19.3055 17.25 20.25'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1652_2926'>
          <rect width={width || '24'} height={height || '24'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default MicroscopeIcon
