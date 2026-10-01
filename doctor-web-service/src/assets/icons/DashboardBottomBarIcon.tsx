import React from 'react'
import {IconProps} from '../../types/IconProps'

const DashboardBottomBarIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '25'}
      height={height || '24'}
      viewBox='0 0 25 24'
      fill={color || 'none'}
    >
      <g opacity='0.72' clipPath='url(#clip0_13072_65)'>
        <path
          d='M8.25 10.5C9.90685 10.5 11.25 9.15685 11.25 7.5C11.25 5.84315 9.90685 4.5 8.25 4.5C6.59315 4.5 5.25 5.84315 5.25 7.5C5.25 9.15685 6.59315 10.5 8.25 10.5Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M17.25 10.5C18.9069 10.5 20.25 9.15685 20.25 7.5C20.25 5.84315 18.9069 4.5 17.25 4.5C15.5931 4.5 14.25 5.84315 14.25 7.5C14.25 9.15685 15.5931 10.5 17.25 10.5Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.25 19.5C9.90685 19.5 11.25 18.1569 11.25 16.5C11.25 14.8431 9.90685 13.5 8.25 13.5C6.59315 13.5 5.25 14.8431 5.25 16.5C5.25 18.1569 6.59315 19.5 8.25 19.5Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M17.25 19.5C18.9069 19.5 20.25 18.1569 20.25 16.5C20.25 14.8431 18.9069 13.5 17.25 13.5C15.5931 13.5 14.25 14.8431 14.25 16.5C14.25 18.1569 15.5931 19.5 17.25 19.5Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_13072_65'>
          <rect
            width='24'
            height={height || '24'}
            fill={color || 'white'}
            transform='translate(0.75)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default DashboardBottomBarIcon
