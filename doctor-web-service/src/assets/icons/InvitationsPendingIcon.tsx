import React from 'react'
import {IconProps} from '../../types/IconProps'

const InvitationsPendingIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width ?? '20'}
      height={height ?? '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_972_394)'>
        <path
          d='M2.5 7.5V15.625C2.5 15.7908 2.56585 15.9497 2.68306 16.0669C2.80027 16.1842 2.95924 16.25 3.125 16.25H16.875C17.0408 16.25 17.1997 16.1842 17.3169 16.0669C17.4342 15.9497 17.5 15.7908 17.5 15.625V7.5L10 2.5L2.5 7.5Z'
          stroke={color ?? '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M17.5 7.5L11.3641 11.875H8.63672L2.5 7.5'
          stroke={color ?? '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_972_394'>
          <rect width={width ?? '20'} height={height ?? '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default InvitationsPendingIcon
