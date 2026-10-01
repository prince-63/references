import {IconProps} from '../../types/IconProps'

const PatientPlusMobileIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_4910_4789)'>
        <path
          d='M10 12.5C11.7259 12.5 13.125 11.1009 13.125 9.375C13.125 7.64911 11.7259 6.25 10 6.25C8.27411 6.25 6.875 7.64911 6.875 9.375C6.875 11.1009 8.27411 12.5 10 12.5Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M4.98438 15.5747C5.45462 14.6485 6.17216 13.8705 7.05745 13.3271C7.94275 12.7837 8.96123 12.4961 10 12.4961C11.0388 12.4961 12.0572 12.7837 12.9425 13.3271C13.8278 13.8705 14.5454 14.6485 15.0156 15.5747'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M13.75 4.375H17.5'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M15.625 2.5V6.25'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M17.3963 8.75003C17.6599 10.3167 17.4189 11.9266 16.7079 13.3474C15.9969 14.7681 14.8528 15.9261 13.4408 16.6542C12.0287 17.3823 10.4218 17.6428 8.85205 17.3981C7.28231 17.1533 5.83096 16.416 4.70757 15.2926C3.58419 14.1693 2.84689 12.7179 2.60215 11.1482C2.35742 9.57841 2.6179 7.9715 3.34598 6.55945C4.07407 5.1474 5.23209 4.00329 6.65283 3.2923C8.07357 2.58132 9.6835 2.34026 11.2502 2.60394'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_4910_4789'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default PatientPlusMobileIcon
