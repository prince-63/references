import {IconProps} from 'types/IconProps'

const CaretDoubleRightIcon = (props: IconProps) => {
  const {width, height, color} = props
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_8240_7887)'>
        <path
          d='M4.375 3.75L10.625 10L4.375 16.25'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.625 3.75L16.875 10L10.625 16.25'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_8240_7887'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CaretDoubleRightIcon
