import React from 'react'
import {IconProps} from '../../types/IconProps'

const StartingSoonIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_972_361)'>
        <path
          d='M5.625 3.11535V16.8841C5.62704 16.994 5.65802 17.1014 5.7148 17.1954C5.77158 17.2895 5.85217 17.367 5.94843 17.42C6.0447 17.473 6.15323 17.4997 6.2631 17.4973C6.37297 17.495 6.48028 17.4638 6.57422 17.4068L17.8305 10.5224C17.9204 10.468 17.9947 10.3913 18.0463 10.2997C18.0979 10.2081 18.1251 10.1048 18.1251 9.99972C18.1251 9.89462 18.0979 9.7913 18.0463 9.69974C17.9947 9.60818 17.9204 9.53149 17.8305 9.47706L6.57422 2.59269C6.48028 2.53566 6.37297 2.50442 6.2631 2.50209C6.15323 2.49977 6.0447 2.52646 5.94843 2.57946C5.85217 2.63247 5.77158 2.70991 5.7148 2.804C5.65802 2.89808 5.62704 3.00547 5.625 3.11535Z'
          stroke={color || '#096C0E'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_972_361'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default StartingSoonIcon
