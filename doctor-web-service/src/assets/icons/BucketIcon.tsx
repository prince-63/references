import {IconProps} from '../../types/IconProps'

const BucketIcon = ({height, width}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_2268_34564)'>
        <path
          d='M19 9.00049L17 18.0005C16.9065 18.5737 16.6552 19.0877 16.2897 19.4532C15.9243 19.8186 15.4679 20.0123 15 20.0005H9C8.53211 20.0123 8.07572 19.8186 7.71028 19.4532C7.34485 19.0877 7.0935 18.5737 7 18.0005L5 9.00049H19Z'
          stroke='#666666'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7 9.00049C7 7.67441 7.52678 6.40264 8.46447 5.46495C9.40215 4.52727 10.6739 4.00049 12 4.00049C13.3261 4.00049 14.5979 4.52727 15.5355 5.46495C16.4732 6.40264 17 7.67441 17 9.00049'
          stroke='#666666'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_2268_34564'>
          <rect width='24' height='24' fill='white' transform='translate(0 0.000488281)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default BucketIcon
