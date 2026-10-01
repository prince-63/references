const BellSimpleIcon = ({color, className}: {color: string; className: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1508_14986)'>
        <path
          d='M7.5 18.166H12.5'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4.37515 8.79102C4.37515 7.29917 4.96778 5.86843 6.02267 4.81354C7.07756 3.75865 8.5083 3.16602 10.0001 3.16602C11.492 3.16602 12.9227 3.75865 13.9776 4.81354C15.0325 5.86843 15.6251 7.29917 15.6251 8.79102C15.6251 11.5895 16.2736 13.8379 16.7892 14.7285C16.844 14.8234 16.8728 14.9309 16.8729 15.0405C16.873 15.15 16.8444 15.2576 16.7898 15.3526C16.7352 15.4475 16.6566 15.5264 16.5619 15.5815C16.4672 15.6365 16.3597 15.6656 16.2501 15.666H3.75015C3.64076 15.6654 3.53345 15.636 3.43896 15.5809C3.34448 15.5258 3.26611 15.4468 3.2117 15.3519C3.15729 15.257 3.12874 15.1495 3.12891 15.0401C3.12907 14.9307 3.15795 14.8233 3.21265 14.7285C3.72749 13.8379 4.37515 11.5887 4.37515 8.79102Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1508_14986'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default BellSimpleIcon
