const SmileyIcon = ({color, className}: {color: string; className?: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={'20'}
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_5860_4635)'>
        <path
          d='M10 18.1656C14.1421 18.1656 17.5 14.8078 17.5 10.6656C17.5 6.52351 14.1421 3.16565 10 3.16565C5.85786 3.16565 2.5 6.52351 2.5 10.6656C2.5 14.8078 5.85786 18.1656 10 18.1656Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7.1875 10.0406C7.70527 10.0406 8.125 9.62092 8.125 9.10315C8.125 8.58538 7.70527 8.16565 7.1875 8.16565C6.66973 8.16565 6.25 8.58538 6.25 9.10315C6.25 9.62092 6.66973 10.0406 7.1875 10.0406Z'
          fill={color || '#666666'}
        />
        <path
          d='M12.8125 10.0406C13.3303 10.0406 13.75 9.62092 13.75 9.10315C13.75 8.58538 13.3303 8.16565 12.8125 8.16565C12.2947 8.16565 11.875 8.58538 11.875 9.10315C11.875 9.62092 12.2947 10.0406 12.8125 10.0406Z'
          fill={color || '#666666'}
        />
        <path
          d='M13.125 12.5406C12.4766 13.6617 11.3883 14.4156 10 14.4156C8.61172 14.4156 7.52344 13.6617 6.875 12.5406'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_5860_4635'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.665649)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default SmileyIcon
