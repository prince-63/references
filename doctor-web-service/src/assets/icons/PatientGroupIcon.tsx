import {IconProps} from 'types/IconProps'

const PatientGroupIcon = ({width, height, color, className}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '21'}
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_1508_14826)'>
        <path
          d='M15 10.041C15.7278 10.0405 16.4457 10.2097 17.0967 10.5351C17.7477 10.8606 18.3138 11.3334 18.75 11.916'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M1.25 11.916C1.68625 11.3334 2.25234 10.8606 2.90331 10.5351C3.55429 10.2097 4.27219 10.0405 5 10.041'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 15.041C11.7259 15.041 13.125 13.6419 13.125 11.916C13.125 10.1901 11.7259 8.79102 10 8.79102C8.27411 8.79102 6.875 10.1901 6.875 11.916C6.875 13.6419 8.27411 15.041 10 15.041Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.625 17.541C6.07366 16.7796 6.71325 16.1485 7.48054 15.7101C8.24784 15.2716 9.11627 15.041 10 15.041C10.8837 15.041 11.7522 15.2716 12.5195 15.7101C13.2867 16.1485 13.9263 16.7796 14.375 17.541'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M12.5781 6.91602C12.695 6.46333 12.9365 6.05249 13.2751 5.73016C13.6138 5.40782 14.036 5.18691 14.4939 5.09251C14.9518 4.99811 15.427 5.034 15.8656 5.19611C16.3041 5.35821 16.6884 5.64004 16.9748 6.00959C17.2612 6.37913 17.4382 6.82158 17.4858 7.28668C17.5333 7.75179 17.4495 8.22091 17.2439 8.64077C17.0382 9.06064 16.7189 9.41442 16.3223 9.66193C15.9256 9.90945 15.4675 10.0408 15 10.041'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4.99972 10.041C4.53219 10.0408 4.07409 9.90945 3.67745 9.66193C3.28082 9.41442 2.96153 9.06064 2.75587 8.64077C2.5502 8.22091 2.46639 7.75179 2.51395 7.28668C2.56151 6.82158 2.73854 6.37913 3.02494 6.00959C3.31134 5.64004 3.69562 5.35821 4.13415 5.19611C4.57267 5.034 5.04787 4.99811 5.50577 5.09251C5.96367 5.18691 6.38592 5.40782 6.72458 5.73016C7.06323 6.05249 7.30471 6.46333 7.42159 6.91602'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_1508_14826'>
          <rect
            width={width || '20'}
            height={height || '20'}
            fill='white'
            transform='translate(0 0.666016)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default PatientGroupIcon
