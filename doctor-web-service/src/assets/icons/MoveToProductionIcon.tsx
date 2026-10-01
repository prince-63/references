import React from 'react'
import {IconProps} from '../../types/IconProps'

const MoveToProductionIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_972_357)'>
        <path
          d='M2.5 9.375L10 1.875L17.5 9.375H13.75V16.25C13.75 16.4158 13.6842 16.5747 13.5669 16.6919C13.4497 16.8092 13.2908 16.875 13.125 16.875H6.875C6.70924 16.875 6.55027 16.8092 6.43306 16.6919C6.31585 16.5747 6.25 16.4158 6.25 16.25V9.375H2.5Z'
          stroke={color || '#9F550F'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_972_357'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default MoveToProductionIcon
