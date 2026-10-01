import React from 'react'
import {IconProps} from '../../types/IconProps'

const IconLock = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '21'}
      viewBox='0 0 20 21'
      fill='none'
    >
      <g clipPath='url(#clip0_16019_27309)'>
        <path
          d='M16.25 7.375H3.75C3.40482 7.375 3.125 7.65482 3.125 8V16.75C3.125 17.0952 3.40482 17.375 3.75 17.375H16.25C16.5952 17.375 16.875 17.0952 16.875 16.75V8C16.875 7.65482 16.5952 7.375 16.25 7.375Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 13.3125C10.5178 13.3125 10.9375 12.8928 10.9375 12.375C10.9375 11.8572 10.5178 11.4375 10 11.4375C9.48223 11.4375 9.0625 11.8572 9.0625 12.375C9.0625 12.8928 9.48223 13.3125 10 13.3125Z'
          fill={color || '#666666'}
        />
        <path
          d='M6.875 7.375V4.875C6.875 4.0462 7.20424 3.25134 7.79029 2.66529C8.37634 2.07924 9.1712 1.75 10 1.75C10.8288 1.75 11.6237 2.07924 12.2097 2.66529C12.7958 3.25134 13.125 4.0462 13.125 4.875V7.375'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_16019_27309'>
          <rect
            width={width || '20'}
            height={height || '20'}
            fill='white'
            transform='translate(0 0.5)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default IconLock
