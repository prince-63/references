import React from 'react'
import {IconProps} from 'types/IconProps'

const FirstAidKit = (props: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width ? props.width : '20'}
      height={props.height ? props.height : '21'}
      viewBox='0 0 20 21'
      fill='none'
    >
      <g clipPath='url(#clip0_1710_20330)'>
        <path
          d='M16.875 5.66602H3.125C2.77982 5.66602 2.5 5.94584 2.5 6.29102V16.291C2.5 16.6362 2.77982 16.916 3.125 16.916H16.875C17.2202 16.916 17.5 16.6362 17.5 16.291V6.29102C17.5 5.94584 17.2202 5.66602 16.875 5.66602Z'
          stroke={props.color || '#735BF2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.125 5.66602V4.41602C13.125 4.0845 12.9933 3.76655 12.7589 3.53213C12.5245 3.29771 12.2065 3.16602 11.875 3.16602H8.125C7.79348 3.16602 7.47554 3.29771 7.24112 3.53213C7.0067 3.76655 6.875 4.0845 6.875 4.41602V5.66602'
          stroke={props.color || '#735BF2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 9.41602V13.166'
          stroke={props.color || '#735BF2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11.875 11.291H8.125'
          stroke={props.color || '#735BF2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1710_20330'>
          <rect
            width={props.width || '20'}
            height={props.height || '20'}
            fill='white'
            transform='translate(0 0.666016)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default FirstAidKit
