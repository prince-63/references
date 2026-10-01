export default function ArrowUpDownIcon({...props}) {
  const {width, height, color1, color2} = props
  return (
    <svg
      width={width || '16'}
      height={height || '16'}
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g id='CaretUpDown' clipPath='url(#clip0_2331_1635)'>
        <path
          id='Vector'
          d='M5 11L8 14L11 11'
          stroke={color1 || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          id='Vector_2'
          d='M5 5L8 2L11 5'
          stroke={color2 || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_2331_1635'>
          <rect width={width || '16'} height={height || '16'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}
