import {IconProps} from '../../types/IconProps'

const StoreIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_4072_28210)'>
        <path
          d='M4.5 13.0859V20.2494H19.5V13.0859'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.0625 3.75H18.9375C19.1004 3.75003 19.2589 3.80311 19.389 3.90122C19.519 3.99932 19.6136 4.13711 19.6584 4.29375L21 9H3L4.34438 4.29375C4.38904 4.13757 4.48321 4.00012 4.61272 3.90206C4.74222 3.804 4.90006 3.75064 5.0625 3.75Z'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M9 9V10.5C9 11.2956 8.68393 12.0587 8.12132 12.6213C7.55871 13.1839 6.79565 13.5 6 13.5C5.20435 13.5 4.44129 13.1839 3.87868 12.6213C3.31607 12.0587 3 11.2956 3 10.5V9'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M15 9V10.5C15 11.2956 14.6839 12.0587 14.1213 12.6213C13.5587 13.1839 12.7956 13.5 12 13.5C11.2044 13.5 10.4413 13.1839 9.87868 12.6213C9.31607 12.0587 9 11.2956 9 10.5V9'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M21 9V10.5C21 11.2956 20.6839 12.0587 20.1213 12.6213C19.5587 13.1839 18.7956 13.5 18 13.5C17.2044 13.5 16.4413 13.1839 15.8787 12.6213C15.3161 12.0587 15 11.2956 15 10.5V9'
          stroke={color || '#735BF2'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_4072_28210'>
          <rect width={width || '24'} height={height || '24'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default StoreIcon
