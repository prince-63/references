import React from 'react'
import {IconProps} from '../../types/IconProps'

const ArchiveIcon = ({color, className}: IconProps) => {
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
        <polyline points='21 8 21 21 3 21 3 8'></polyline>
        <rect x='1' y='3' width='22' height='5'></rect>
        <line x1='10' y1='12' x2='14' y2='12'></line>
      </g>
    </svg>
  )
}

export default ArchiveIcon
