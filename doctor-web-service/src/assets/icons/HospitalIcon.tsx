const HospitalIcon = ({color, className}: {color: string; className: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1508_14811)'>
        <path
          d='M2.5 17.541H19.375'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.75 17.541V4.41602C3.75 4.25026 3.81585 4.09128 3.93306 3.97407C4.05027 3.85686 4.20924 3.79102 4.375 3.79102H11.875C12.0408 3.79102 12.1997 3.85686 12.3169 3.97407C12.4342 4.09128 12.5 4.25026 12.5 4.41602V17.541'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M12.5 10.041H17.5C17.6658 10.041 17.8247 10.1069 17.9419 10.2241C18.0592 10.3413 18.125 10.5003 18.125 10.666V17.541'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.125 6.29102V10.041'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.25 8.16602H10'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 17.541V13.166H6.25V17.541'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1508_14811'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default HospitalIcon
