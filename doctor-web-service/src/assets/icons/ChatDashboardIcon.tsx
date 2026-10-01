const ChatDashboardIcon = ({color, className}: {color: string; className: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='21'
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1508_14962)'>
        <path
          d='M3.52734 18.6434C3.43631 18.7199 3.32531 18.769 3.20739 18.7846C3.08947 18.8003 2.96952 18.782 2.86164 18.7319C2.75376 18.6818 2.66242 18.6019 2.59836 18.5017C2.5343 18.4014 2.50018 18.285 2.5 18.166V5.66602C2.5 5.50026 2.56585 5.34128 2.68306 5.22407C2.80027 5.10686 2.95924 5.04102 3.125 5.04102H16.875C17.0408 5.04102 17.1997 5.10686 17.3169 5.22407C17.4342 5.34128 17.5 5.50026 17.5 5.66602V15.666C17.5 15.8318 17.4342 15.9907 17.3169 16.108C17.1997 16.2252 17.0408 16.291 16.875 16.291H6.25L3.52734 18.6434Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7.5 9.41602H12.5'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7.5 11.916H12.5'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1508_14962'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ChatDashboardIcon
