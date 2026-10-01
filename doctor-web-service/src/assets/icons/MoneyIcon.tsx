import React from 'react'
import {IconProps} from 'types/IconProps'

const MoneyIcon = (props: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width ? props.width : '32'}
      height={props.height ? props.height : '32'}
      viewBox='0 0 32 32'
      fill='none'
    >
      <g clipPath='url(#clip0_15479_1277)'>
        <path
          d='M16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20Z'
          stroke={props?.color ? props.color : '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M30 8H2V24H30V8Z'
          stroke={props?.color ? props.color : '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M30 13C28.7509 12.7883 27.5985 12.1933 26.7026 11.2974C25.8067 10.4015 25.2117 9.24915 25 8'
          stroke={props?.color ? props.color : '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M25 24C25.2117 22.7509 25.8067 21.5985 26.7026 20.7026C27.5985 19.8067 28.7509 19.2117 30 19'
          stroke={props?.color ? props.color : '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2 19C3.24915 19.2117 4.4015 19.8067 5.29738 20.7026C6.19326 21.5985 6.78828 22.7509 7 24'
          stroke={props?.color ? props.color : '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7 8C6.78828 9.24915 6.19326 10.4015 5.29738 11.2974C4.4015 12.1933 3.24915 12.7883 2 13'
          stroke={props?.color ? props.color : '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_15479_1277'>
          <rect width='32' height='32' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default MoneyIcon
