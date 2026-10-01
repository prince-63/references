import React from 'react'
import {IconProps} from 'types/IconProps'

const Shop = (props: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width || '32'}
      height={props.width || '32'}
      viewBox={`0 0 32 32`}
      fill='none'
    >
      <g clipPath='url(#clip0_4095_13987)'>
        <path
          d='M6 17.4482V26.9995H26V17.4482'
          stroke={props.color || '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.75 5H25.25C25.4672 5.00004 25.6785 5.07082 25.852 5.20162C26.0254 5.33243 26.1515 5.51615 26.2113 5.725L28 12H4L5.7925 5.725C5.85206 5.51676 5.97762 5.33349 6.15029 5.20275C6.32296 5.072 6.53341 5.00085 6.75 5Z'
          stroke={props.color || '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M12 12V14C12 15.0609 11.5786 16.0783 10.8284 16.8284C10.0783 17.5786 9.06087 18 8 18C6.93913 18 5.92172 17.5786 5.17157 16.8284C4.42143 16.0783 4 15.0609 4 14V12'
          stroke={props.color || '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M20 12V14C20 15.0609 19.5786 16.0783 18.8284 16.8284C18.0783 17.5786 17.0609 18 16 18C14.9391 18 13.9217 17.5786 13.1716 16.8284C12.4214 16.0783 12 15.0609 12 14V12'
          stroke={props.color || '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M28 12V14C28 15.0609 27.5786 16.0783 26.8284 16.8284C26.0783 17.5786 25.0609 18 24 18C22.9391 18 21.9217 17.5786 21.1716 16.8284C20.4214 16.0783 20 15.0609 20 14V12'
          stroke={props.color || '#666666'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_4095_13987'>
          <rect width={props.width || '32'} height={props.width || '32'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default Shop
