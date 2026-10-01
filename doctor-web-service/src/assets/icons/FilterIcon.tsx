import React from 'react'
import {IconProps} from 'types/IconProps'

const FilterIcon = (props: IconProps) => {
  const {width, height, color} = props
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_10475_3034)'>
        <path
          d='M17.25 7.5H20.25'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.75 7.5H14.25'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11.25 16.5H20.25'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.75 16.5H8.25'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14.25 5.25V9.75'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.25 14.25V18.75'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_10475_3034'>
          <rect width={width || '24'} height={height || '24'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default FilterIcon
