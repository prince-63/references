import React from 'react'
import {IconProps} from 'types/IconProps'

const TrashOutline = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width ?? '25'}
      height={height ?? '24'}
      viewBox='0 0 25 24'
      fill='none'
    >
      <g clipPath='url(#clip0_1838_399)'>
        <path
          d='M20.75 5.25H4.25'
          stroke={color ?? '#F45045'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.75 2.25H16.25'
          stroke={color ?? '#F45045'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M19.25 5.25V19.5C19.25 19.6989 19.171 19.8897 19.0303 20.0303C18.8897 20.171 18.6989 20.25 18.5 20.25H6.5C6.30109 20.25 6.11032 20.171 5.96967 20.0303C5.82902 19.8897 5.75 19.6989 5.75 19.5V5.25'
          stroke={color ?? '#F45045'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1838_399'>
          <rect
            width={width || '24'}
            height={height ?? '24'}
            fill='white'
            transform='translate(0.5)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default TrashOutline
