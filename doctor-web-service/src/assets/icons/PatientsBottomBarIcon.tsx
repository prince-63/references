import React from 'react'
import {IconProps} from '../../types/IconProps'

const PatientsBottomBarIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '25'}
      height={height || '24'}
      viewBox='0 0 25 24'
      fill={color || 'none'}
    >
      <g opacity='0.72' clipPath='url(#clip0_13072_243)'>
        <path
          d='M12.25 15C15.5637 15 18.25 12.3137 18.25 9C18.25 5.68629 15.5637 3 12.25 3C8.93629 3 6.25 5.68629 6.25 9C6.25 12.3137 8.93629 15 12.25 15Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.25 20.25C5.06594 17.1122 8.36406 15 12.25 15C16.1359 15 19.4341 17.1122 21.25 20.25'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_13072_243'>
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

export default PatientsBottomBarIcon
