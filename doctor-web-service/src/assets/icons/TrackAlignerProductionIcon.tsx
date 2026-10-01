import {IconProps} from '../../types/IconProps'

const TrackAlignerProductionIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_6980_898)'>
        <path
          d='M14.375 3.75H17.5V6.875'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.625 16.25H2.5V13.125'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M17.5 13.125V16.25H14.375'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2.5 6.875V3.75H5.625'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.25 6.875V13.125'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.75 6.875V13.125'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11.25 6.875V13.125'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.75 6.875V13.125'
          stroke='#666666'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_6980_898'>
          <rect width='20' height='20' fill={color || 'white'} />
        </clipPath>
      </defs>
    </svg>
  )
}

export default TrackAlignerProductionIcon
