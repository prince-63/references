import React from 'react'
import {IconProps} from '../../types/IconProps'

const NotePadIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '32'}
      height={height || '32'}
      viewBox='0 0 32 32'
      fill='none'
    >
      <g clipPath='url(#clip0_7711_1930)'>
        <g filter='url(#filter0_d_7711_1930)'>
          <path
            d='M12 19H20'
            stroke={color || '#735BF2'}
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </g>
        <path
          d='M12 15H20'
          stroke={color || '#735BF2'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M20 5H25C25.2652 5 25.5196 5.10536 25.7071 5.29289C25.8946 5.48043 26 5.73478 26 6V27C26 27.2652 25.8946 27.5196 25.7071 27.7071C25.5196 27.8946 25.2652 28 25 28H7C6.73478 28 6.48043 27.8946 6.29289 27.7071C6.10536 27.5196 6 27.2652 6 27V6C6 5.73478 6.10536 5.48043 6.29289 5.29289C6.48043 5.10536 6.73478 5 7 5H12'
          stroke={color || '#735BF2'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11 9V8C11 6.67392 11.5268 5.40215 12.4645 4.46447C13.4021 3.52678 14.6739 3 16 3C17.3261 3 18.5979 3.52678 19.5355 4.46447C20.4732 5.40215 21 6.67392 21 8V9H11Z'
          stroke={color || '#735BF2'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <filter
          id='filter0_d_7711_1930'
          x='7'
          y='18'
          width='18'
          height='10'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4' />
          <feGaussianBlur stdDeviation='2' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_7711_1930' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_7711_1930'
            result='shape'
          />
        </filter>
        <clipPath id='clip0_7711_1930'>
          <rect width={width || '32'} height={height || '32'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default NotePadIcon
