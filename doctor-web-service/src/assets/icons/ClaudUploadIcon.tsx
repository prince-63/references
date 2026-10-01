const ClaudUploadIcon = ({
  height,
  width,
  color,
}: {
  height?: string
  width?: string
  color?: string
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={'20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_5032_433)'>
        <path
          d='M8.74994 16.25H5.62494C5.0046 16.2492 4.39151 16.1166 3.82636 15.8608C3.26121 15.605 2.75691 15.2319 2.34694 14.7663C1.93697 14.3008 1.63069 13.7534 1.44843 13.1604C1.26617 12.5674 1.21209 11.9425 1.28979 11.327C1.36749 10.7116 1.57519 10.1197 1.8991 9.5906C2.22302 9.06153 2.65574 8.6074 3.16856 8.25834C3.68137 7.90928 4.26256 7.67326 4.87355 7.56595C5.48455 7.45864 6.11137 7.4825 6.71244 7.63593'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M9.37503 12.5L11.875 10L14.375 12.5'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M11.875 16.25V10'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.25003 10C6.2503 8.87325 6.55515 7.76753 7.13234 6.79984C7.70953 5.83215 8.53758 5.0385 9.52887 4.50286C10.5202 3.96722 11.6378 3.70951 12.7636 3.75702C13.8893 3.80453 14.9813 4.15549 15.9239 4.77274C16.8665 5.39 17.6248 6.2506 18.1184 7.26348C18.612 8.27636 18.8226 9.40383 18.7279 10.5266C18.6333 11.6494 18.2368 12.7257 17.5806 13.6416C16.9244 14.5575 16.0327 15.279 15 15.7297'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_5032_433'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ClaudUploadIcon
