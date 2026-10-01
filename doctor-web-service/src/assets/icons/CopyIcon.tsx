import React from 'react'

const CopyIcon = ({height, width, color}: {height?: string; width?: string; color?: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_12332_8373)'>
        <path
          d='M13.125 13.125H16.875V3.125H6.875V6.875'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.125 6.875H3.125V16.875H13.125V6.875Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_12332_8373'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CopyIcon
