import React from 'react'

const VideoThumbnailIcon = ({
  height,
  width,
  color,
}: {
  height?: string
  width?: string
  color?: string
}) => {
  return (
    <svg
      width={width || '50'}
      height={height || '50'}
      viewBox='0 0 50 50'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect width={width || '50'} height={height || '50'} fill={color || '#D2D2D2'} />
      <rect x='-3747' y='-1219' width='7837' height='3773' stroke='black' strokeWidth='8' />
      <g clipPath='url(#clip0_1_1983)'>
        <rect width='1920' height='1080' transform='translate(-786 -506)' fill='white' />
        <g filter='url(#filter0_d_1_1983)'>
          <rect x='-72' y='-415' width='1086' height='832' rx='8' fill='white' />
        </g>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M8.33203 7.29199C8.33203 5.5661 9.73114 4.16699 11.457 4.16699H32.0376C32.8664 4.16699 33.6613 4.49623 34.2473 5.08228L40.7501 11.585C41.3361 12.1711 41.6654 12.9659 41.6654 13.7947V42.7087C41.6654 44.4346 40.2662 45.8337 38.5404 45.8337H11.457C9.73114 45.8337 8.33203 44.4346 8.33203 42.7087V7.29199ZM39.582 14.5837H32.2904C31.7151 14.5837 31.2487 14.1173 31.2487 13.542V6.25033H11.457C10.8817 6.25033 10.4154 6.7167 10.4154 7.29199V42.7087C10.4154 43.284 10.8817 43.7503 11.457 43.7503H38.5404C39.1157 43.7503 39.582 43.284 39.582 42.7087V14.5837Z'
          fill='#E0E2E7'
        />
        <g clipPath='url(#clip1_1_1983)'>
          <path
            d='M34.1668 22.8337L28.3335 27.0003L34.1668 31.167V22.8337Z'
            stroke='#B0B0B0'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M26.6668 21.167H17.5002C16.5797 21.167 15.8335 21.9132 15.8335 22.8337V31.167C15.8335 32.0875 16.5797 32.8337 17.5002 32.8337H26.6668C27.5873 32.8337 28.3335 32.0875 28.3335 31.167V22.8337C28.3335 21.9132 27.5873 21.167 26.6668 21.167Z'
            stroke='#B0B0B0'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </g>
      </g>
      <defs>
        <filter
          id='filter0_d_1_1983'
          x='-106'
          y='-449'
          width='1154'
          height='900'
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
          <feOffset />
          <feGaussianBlur stdDeviation='17' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0588 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1_1983' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_1_1983'
            result='shape'
          />
        </filter>
        <clipPath id='clip0_1_1983'>
          <rect width='1920' height='1080' fill='white' transform='translate(-786 -506)' />
        </clipPath>
        <clipPath id='clip1_1_1983'>
          <rect width='20' height='20' fill='white' transform='translate(15 17)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default VideoThumbnailIcon
