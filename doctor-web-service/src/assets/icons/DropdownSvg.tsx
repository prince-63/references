import React from 'react'
import {IconProps} from 'types/IconProps'

const DropdownSvg = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '13'}
      height={height || '22'}
      viewBox='0 0 13 22'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M1.01694 1.01626C0.455301 1.5779 0.455301 2.4885 1.01694 3.05015L9.79047 11.8237C10.3521 12.3853 11.2627 12.3853 11.8244 11.8237C12.386 11.262 12.386 10.3514 11.8244 9.78979L3.05083 1.01626C2.48919 0.454618 1.57858 0.454619 1.01694 1.01626Z'
        fill={color || 'black'}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M1.01694 20.7611C0.455301 20.1994 0.455301 19.2888 1.01694 18.7272L9.79047 9.95367C10.3521 9.39203 11.2627 9.39203 11.8244 9.95367C12.386 10.5153 12.386 11.4259 11.8244 11.9876L3.05083 20.7611C2.48919 21.3227 1.57858 21.3227 1.01694 20.7611Z'
        fill={color || 'black'}
      />
    </svg>
  )
}

export default DropdownSvg
