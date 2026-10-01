import React from 'react'
import {IconProps} from '../../types/IconProps'

const AlignerChangesAndCheckInsIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_972_372)'>
        <path
          d='M6.875 7.5H3.125V3.75'
          stroke={color || '#135FA2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.125 7.50027L5.33437 5.29089C6.61388 4.01144 8.34621 3.28799 10.1556 3.27746C11.9651 3.26693 13.7057 3.97017 15 5.23464'
          stroke={color || '#135FA2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.125 12.5H16.875V16.25'
          stroke={color || '#135FA2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.875 12.5L14.6656 14.7094C13.3861 15.9888 11.6538 16.7123 9.84437 16.7228C8.03494 16.7333 6.29431 16.0301 5 14.7656'
          stroke={color || '#135FA2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_972_372'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default AlignerChangesAndCheckInsIcon
