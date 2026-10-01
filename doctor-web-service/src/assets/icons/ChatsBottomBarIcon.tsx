export interface IconProps {
  height?: string
  width?: string
  color?: string
  secondaryColor?: string
}
const ChatsBottomBarIcon = ({height, width, color, secondaryColor}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '25'}
      height={height || '24'}
      viewBox='0 0 25 24'
      fill={color || 'none'}
    >
      <g opacity='0.72' clipPath='url(#clip0_13072_249)'>
        <path
          d='M4.98281 21.5728C4.87357 21.6647 4.74038 21.7235 4.59887 21.7423C4.45737 21.7612 4.31343 21.7392 4.18397 21.679C4.05451 21.6189 3.9449 21.523 3.86803 21.4028C3.79116 21.2825 3.75021 21.1428 3.75 21V6C3.75 5.80109 3.82902 5.61032 3.96967 5.46967C4.11032 5.32902 4.30109 5.25 4.5 5.25H21C21.1989 5.25 21.3897 5.32902 21.5303 5.46967C21.671 5.61032 21.75 5.80109 21.75 6V18C21.75 18.1989 21.671 18.3897 21.5303 18.5303C21.3897 18.671 21.1989 18.75 21 18.75H8.25L4.98281 21.5728Z'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M9.75 10.5H15.75'
          stroke={secondaryColor || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M9.75 13.5H15.75'
          stroke={secondaryColor || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_13072_249'>
          <rect
            width='24'
            height={height || '24'}
            fill={color || 'white'}
            transform='translate(0.75)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ChatsBottomBarIcon
