import React from 'react'
import {IconProps} from '../../types/IconProps'

const ViewLogsIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 22 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M19 2H3C2.44771 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H19C19.5523 18 20 17.5523 20 17V3C20 2.44771 19.5523 2 19 2ZM3 0C1.34315 0 0 1.34315 0 3V17C0 18.6569 1.34315 20 3 20H19C20.6569 20 22 18.6569 22 17V3C22 1.34315 20.6569 0 19 0H3ZM5 5H7V7H5V5ZM10 5C9.4477 5 9 5.44772 9 6C9 6.55228 9.4477 7 10 7H16C16.5523 7 17 6.55228 17 6C17 5.44772 16.5523 5 16 5H10ZM7 9H5V11H7V9ZM9 10C9 9.4477 9.4477 9 10 9H16C16.5523 9 17 9.4477 17 10C17 10.5523 16.5523 11 16 11H10C9.4477 11 9 10.5523 9 10ZM7 13H5V15H7V13ZM9 14C9 13.4477 9.4477 13 10 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H10C9.4477 15 9 14.5523 9 14Z'
        fill={color || 'black'}
      />
    </svg>
  )
}

export default ViewLogsIcon
