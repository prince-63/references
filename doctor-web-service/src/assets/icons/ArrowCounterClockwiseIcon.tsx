const ArrowCounterClockwiseIcon = ({color, className}: {color?: string; className?: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_5860_5127)'>
        <path
          d='M1.875 4.375V8.125H5.625'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.28047 15C6.26318 15.9274 7.49741 16.5447 8.82895 16.7747C10.1605 17.0047 11.5303 16.8373 12.7672 16.2932C14.0041 15.7492 15.0532 14.8527 15.7835 13.7158C16.5139 12.579 16.893 11.2521 16.8735 9.90095C16.854 8.54984 16.4368 7.23442 15.674 6.11906C14.9112 5.0037 13.8366 4.13786 12.5846 3.62971C11.3325 3.12156 9.95847 2.99365 8.63412 3.26195C7.30977 3.53025 6.09385 4.18287 5.13828 5.13826L1.875 8.12498'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_5860_5127'>
          <rect width='20' height='20' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ArrowCounterClockwiseIcon
