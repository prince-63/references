import {IconProps} from '../../types/IconProps'

const IconChecks = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'
    >
      <g clipPath='url(#clip0_16019_27381)'>
        <path
          d='M1.25 10.1789L4.25 13.125L11.25 6.25'
          stroke={color || '#666666'}
          strokeWidth={'1.25'}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M9.84082 11.25L11.7502 13.125L18.7502 6.25'
          stroke={color || '#666666'}
          strokeWidth={'1.25'}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_16019_27381'>
          <rect width={width || '20'} height={height || '20'} fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default IconChecks
