const CashIcon = ({color, className}: {color: string; className: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1508_14854)'>
        <path
          d='M9.99951 13.166C11.3802 13.166 12.4995 12.0467 12.4995 10.666C12.4995 9.2853 11.3802 8.16602 9.99951 8.16602C8.6188 8.16602 7.49951 9.2853 7.49951 10.666C7.49951 12.0467 8.6188 13.166 9.99951 13.166Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M18.7495 5.66602H1.24951V15.666H18.7495V5.66602Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M18.7495 8.79102C17.9688 8.65869 17.2486 8.2868 16.6886 7.72688C16.1287 7.16696 15.7568 6.44673 15.6245 5.66602'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M15.6245 15.666C15.7568 14.8853 16.1287 14.1651 16.6886 13.6052C17.2486 13.0452 17.9688 12.6733 18.7495 12.541'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M1.24951 12.541C2.03023 12.6733 2.75045 13.0452 3.31037 13.6052C3.8703 14.1651 4.24219 14.8853 4.37451 15.666'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4.37451 5.66602C4.24219 6.44673 3.8703 7.16696 3.31037 7.72688C2.75045 8.2868 2.03023 8.65869 1.24951 8.79102'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1508_14854'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CashIcon
