const AccessControlIcon = ({color, className}: {color: string; className?: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_15065_25471)'>
        <path
          d='M16.875 8.75V4.375C16.875 4.20924 16.8092 4.05027 16.6919 3.93306C16.5747 3.81585 16.4158 3.75 16.25 3.75H3.75C3.58424 3.75 3.42527 3.81585 3.30806 3.93306C3.19085 4.05027 3.125 4.20924 3.125 4.375V8.75C3.125 16.25 10 18.125 10 18.125C10 18.125 16.875 16.25 16.875 8.75Z'
          stroke={color || '#735BF2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.875 10.625L8.75 12.5L13.125 8.125'
          stroke={color || '#735BF2'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_15065_25471'>
          <rect width='20' height='20' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default AccessControlIcon
