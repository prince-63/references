import React from 'react'
import {IconProps} from '../../types/IconProps'

const IconActivity = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '25'}
      height={height || '25'}
      viewBox={`0 0 ${width || 25} ${height || 25}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0_477_1264)'>
        <path
          d='M2.67065 12.8682H5.67065L9.42065 4.61816L15.4207 20.3682L19.1707 12.8682H22.1707'
          stroke={color || 'black'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_477_1264'>
          <rect width='24' height='24' fill='white' transform='translate(0.420654 0.868164)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default IconActivity
