import {IconProps} from '../../types/IconProps'

const TrackingIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_6980_893)'>
        <path
          d='M1.875 10H4.375L7.5 3.125L12.5 16.25L15.625 10H18.125'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_6980_893'>
          <rect width='20' height='20' fill={color || 'white'} />
        </clipPath>
      </defs>
    </svg>
  )
}

export default TrackingIcon
