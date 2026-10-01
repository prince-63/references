import React from 'react'

const CaretRightIcon = ({
  color,
  width,
  height,
}: {
  color?: string
  width?: string
  height?: string
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width ?? '7'}
      height={height ?? '12'}
      viewBox='0 0 7 12'
      fill='none'
    >
      <path
        d='M1 1L6 6L1 11'
        stroke={color ?? 'white'}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default CaretRightIcon
