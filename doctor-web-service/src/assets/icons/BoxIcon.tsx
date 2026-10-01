const BoxIcon = ({color, className}: {color: string; className?: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1508_14930)'>
        <path
          d='M2.55469 6.67578L10 10.7508L17.4453 6.67578'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.3 2.61968L17.175 6.38374C17.2732 6.43745 17.3551 6.51654 17.4123 6.61273C17.4695 6.70893 17.4997 6.81871 17.5 6.93061V14.4025C17.4997 14.5144 17.4695 14.6242 17.4123 14.7204C17.3551 14.8166 17.2732 14.8957 17.175 14.9494L10.3 18.7134C10.208 18.7638 10.1049 18.7901 10 18.7901C9.89515 18.7901 9.79198 18.7638 9.7 18.7134L2.825 14.9494C2.72683 14.8957 2.64488 14.8166 2.58772 14.7204C2.53055 14.6242 2.50025 14.5144 2.5 14.4025V6.93061C2.50025 6.81871 2.53055 6.70893 2.58772 6.61273C2.64488 6.51654 2.72683 6.43745 2.825 6.38374L9.7 2.61968C9.79198 2.56935 9.89515 2.54297 10 2.54297C10.1049 2.54297 10.208 2.56935 10.3 2.61968Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 10.752V18.7918'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1508_14930'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default BoxIcon
