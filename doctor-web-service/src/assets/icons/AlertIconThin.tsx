import {IconProps} from '../../types/IconProps'

const AlertIconThin = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_7191_30751)'>
        <path
          d='M11.1257 3.14219L17.9585 15.007C18.4375 15.843 17.8187 16.875 16.8328 16.875H3.16714C2.18121 16.875 1.56246 15.843 2.04136 15.007L8.87417 3.14219C9.36636 2.28594 10.6336 2.28594 11.1257 3.14219Z'
          stroke={color || '#F45045'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 11.25V8.125'
          stroke={color || '#F45045'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 15C10.5178 15 10.9375 14.5803 10.9375 14.0625C10.9375 13.5447 10.5178 13.125 10 13.125C9.48223 13.125 9.0625 13.5447 9.0625 14.0625C9.0625 14.5803 9.48223 15 10 15Z'
          fill={color || '#F45045'}
        />
      </g>
      <defs>
        <clipPath id='clip0_7191_30751'>
          <rect width='20' height='20' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default AlertIconThin
