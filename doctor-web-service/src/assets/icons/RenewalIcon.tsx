import React from 'react'
import {IconProps} from '../../types/IconProps'

const RenewalIcon = ({height, width}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_6809_7089)'>
        <path
          d='M10 6.25V10L13.125 11.875'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.625 8.125H2.5V5'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.28125 15.0003C6.26404 15.9277 7.49832 16.5449 8.82987 16.7748C10.1614 17.0047 11.5312 16.8371 12.768 16.293C14.0049 15.7488 15.054 14.8523 15.7842 13.7153C16.5144 12.5784 16.8934 11.2515 16.8739 9.90034C16.8543 8.54923 16.437 7.23385 15.6741 6.11855C14.9112 5.00325 13.8366 4.13749 12.5845 3.62944C11.3324 3.1214 9.9583 2.99359 8.63397 3.262C7.30964 3.5304 6.09377 4.18311 5.13828 5.13858C4.21875 6.06983 3.45937 6.94796 2.5 8.1253'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_6809_7089'>
          <rect width='20' height='20' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default RenewalIcon
