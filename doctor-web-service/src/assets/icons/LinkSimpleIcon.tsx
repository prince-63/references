import {IconProps} from '../../types/IconProps'

const LinkSimpleIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
    >
      <g clipPath='url(#clip0_6607_41306)'>
        <path
          d='M9 15L15 9'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.5 7.13596L13.3181 4.32346C14.1644 3.4909 15.3053 3.02645 16.4924 3.03129C17.6795 3.03612 18.8166 3.50984 19.6561 4.34927C20.4955 5.18869 20.9692 6.32581 20.974 7.51293C20.9789 8.70004 20.5144 9.84098 19.6819 10.6872L16.8638 13.5006'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M7.13401 10.5L4.32151 13.3181C3.48895 14.1644 3.0245 15.3053 3.02933 16.4924C3.03417 17.6795 3.50789 18.8166 4.34732 19.6561C5.18674 20.4955 6.32386 20.9692 7.51097 20.974C8.69809 20.9789 9.83903 20.5144 10.6853 19.6819L13.4987 16.8638'
          stroke={color || '#666666'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_6607_41306'>
          <rect width={width || '24'} height={height || '24'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default LinkSimpleIcon
