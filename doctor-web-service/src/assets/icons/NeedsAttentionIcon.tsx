import React from 'react'
import {IconProps} from '../../types/IconProps'

const NeedsAttentionIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_972_385)'>
        <path
          d='M10 1.25V0.625'
          stroke={color || '#AE2241'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M15.625 3.125L16.25 2.5'
          stroke={color || '#AE2241'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4.375 3.125L3.75 2.5'
          stroke={color || '#AE2241'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.75 13.1252V10.0002C3.74998 9.17539 3.9132 8.35876 4.23027 7.59735C4.54734 6.83594 5.01198 6.14482 5.5974 5.56383C6.18282 4.98284 6.87745 4.52346 7.64125 4.21219C8.40504 3.90091 9.22289 3.74389 10.0477 3.75018C13.4938 3.77596 16.25 6.63221 16.25 10.0783V13.1252'
          stroke={color || '#AE2241'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.625 6.25C12.3984 6.54766 13.75 8.14219 13.75 10'
          stroke={color || '#AE2241'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.875 13.125H3.125C2.77982 13.125 2.5 13.4048 2.5 13.75V15.625C2.5 15.9702 2.77982 16.25 3.125 16.25H16.875C17.2202 16.25 17.5 15.9702 17.5 15.625V13.75C17.5 13.4048 17.2202 13.125 16.875 13.125Z'
          stroke={color || '#AE2241'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_972_385'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default NeedsAttentionIcon
