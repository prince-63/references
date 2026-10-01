import {IconProps} from '../../types/IconProps'

const ReturnIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '38'}
      height={height || '38'}
      viewBox='0 0 38 38'
      fill='none'
    >
      <path
        d='M8.3125 26.125L3.5625 21.375L8.3125 16.625'
        stroke='#F45045'
        strokeWidth='4'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill={color || 'red'}
      />
      <path
        d='M4.75 21.375H26.5703C30.9314 21.375 34.4375 17.7138 34.4375 13.3594V11.875'
        stroke='#F45045'
        strokeWidth='4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default ReturnIcon
