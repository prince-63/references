import React from 'react'

const PackageIcon = ({color}: {color?: string}) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
      <g clipPath='url(#clip0_6952_35684)'>
        <path
          d='M12 12.1021V21.7471'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.06641 7.21094L12.0008 12.1009L20.9352 7.21094'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M20.61 17.1415L12.36 21.6584C12.2496 21.7188 12.1258 21.7504 12 21.7504C11.8742 21.7504 11.7504 21.7188 11.64 21.6584L3.39 17.1415C3.2722 17.077 3.17386 16.9821 3.10526 16.8667C3.03666 16.7513 3.0003 16.6195 3 16.4853V7.51713C3.0003 7.38284 3.03666 7.25111 3.10526 7.13567C3.17386 7.02023 3.2722 6.92533 3.39 6.86088L11.64 2.344C11.7504 2.28361 11.8742 2.25195 12 2.25195C12.1258 2.25195 12.2496 2.28361 12.36 2.344L20.61 6.86088C20.7278 6.92533 20.8261 7.02023 20.8947 7.13567C20.9633 7.25111 20.9997 7.38284 21 7.51713V16.4834C21 16.618 20.9638 16.7501 20.8952 16.8659C20.8266 16.9817 20.7281 17.0769 20.61 17.1415Z'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7.64453 4.5293L16.4983 9.37523V14.2502'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_6952_35684'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default PackageIcon
