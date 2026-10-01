import React from 'react'
import {IconProps} from '../../types/IconProps'

const FolderIcon = ({color, className}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 24 24'
      fill='none'
      stroke={color || '#666666'}
      strokeWidth='1.25'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <g>
        <path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'></path>
      </g>
    </svg>
  )
}

export default FolderIcon
