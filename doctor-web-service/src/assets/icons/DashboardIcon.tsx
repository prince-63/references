const DashboardIcon = ({color, className}: {color: string; className: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1512_22925)'>
        <path
          d='M6.25 9.41602C7.63071 9.41602 8.75 8.29673 8.75 6.91602C8.75 5.5353 7.63071 4.41602 6.25 4.41602C4.86929 4.41602 3.75 5.5353 3.75 6.91602C3.75 8.29673 4.86929 9.41602 6.25 9.41602Z'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.75 9.41602C15.1307 9.41602 16.25 8.29673 16.25 6.91602C16.25 5.5353 15.1307 4.41602 13.75 4.41602C12.3693 4.41602 11.25 5.5353 11.25 6.91602C11.25 8.29673 12.3693 9.41602 13.75 9.41602Z'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.25 16.916C7.63071 16.916 8.75 15.7967 8.75 14.416C8.75 13.0353 7.63071 11.916 6.25 11.916C4.86929 11.916 3.75 13.0353 3.75 14.416C3.75 15.7967 4.86929 16.916 6.25 16.916Z'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.75 16.916C15.1307 16.916 16.25 15.7967 16.25 14.416C16.25 13.0353 15.1307 11.916 13.75 11.916C12.3693 11.916 11.25 13.0353 11.25 14.416C11.25 15.7967 12.3693 16.916 13.75 16.916Z'
          stroke={color || '#B0B0B0'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1512_22925'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default DashboardIcon
