import React from 'react'
import {IconProps} from 'types/IconProps'

const LockIconSimple = (props: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width ?? '32'}
      height={props.height ?? '32'}
      viewBox='0 0 32 32'
      fill='none'
    >
      <g clipPath='url(#clip0_56_20146)'>
        <path
          d='M26 11H6C5.44772 11 5 11.4477 5 12V26C5 26.5523 5.44772 27 6 27H26C26.5523 27 27 26.5523 27 26V12C27 11.4477 26.5523 11 26 11Z'
          stroke={props?.color ?? '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11 11V7C11 5.67392 11.5268 4.40215 12.4645 3.46447C13.4021 2.52678 14.6739 2 16 2C17.3261 2 18.5979 2.52678 19.5355 3.46447C20.4732 4.40215 21 5.67392 21 7V11'
          stroke={props?.color ?? '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_56_20146'>
          <rect width='32' height='32' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default LockIconSimple
