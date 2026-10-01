import React from 'react'
import {IconProps} from '../../types/IconProps'

const CloudIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_3635_78904)'>
        <path
          d='M10.5013 19.5H6.75134C6.00692 19.4991 5.27122 19.3399 4.59303 19.0329C3.91485 18.726 3.3097 18.2783 2.81773 17.7196C2.32576 17.1609 1.95823 16.504 1.73952 15.7925C1.52081 15.0809 1.45592 14.331 1.54916 13.5924C1.6424 12.8539 1.89163 12.1436 2.28033 11.5087C2.66902 10.8738 3.18829 10.3289 3.80367 9.91001C4.41905 9.49113 5.11647 9.20791 5.84967 9.07914C6.58286 8.95037 7.33505 8.979 8.05634 9.16312'
          stroke={color ?? '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11.25 15L14.25 12L17.25 15'
          stroke={color ?? '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14.25 19.5V12'
          stroke={color ?? '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7.5 12.0002C7.50032 10.6481 7.86615 9.32123 8.55877 8.16C9.2514 6.99878 10.2451 6.04639 11.4346 5.40362C12.6242 4.76085 13.9653 4.45161 15.3162 4.50862C16.6671 4.56564 17.9775 4.98678 19.1087 5.72749C20.2398 6.46819 21.1497 7.50092 21.742 8.71637C22.3344 9.93182 22.5871 11.2848 22.4735 12.6321C22.3599 13.9794 21.8842 15.271 21.0967 16.3701C20.3092 17.4692 19.2392 18.335 18 18.8758'
          stroke={color ?? '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_3635_78904'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CloudIcon
