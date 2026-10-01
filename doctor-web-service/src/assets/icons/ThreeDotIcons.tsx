import {IconProps} from 'types/IconProps'

const OrdersIcon = (props: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width ? props.width : '20'}
      height={props.height ? props.height : '21'}
      viewBox='0 0 20 21'
      fill='none'
      className={props.className}
    >
      <g clipPath='url(#clip0_2950_138679)'>
        <path
          d='M10 10.751V18.7885'
          stroke={props.color ? props.color : '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2.55469 6.67578L10 10.7508L17.4453 6.67578'
          stroke={props.color ? props.color : '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M17.175 14.9499L10.3 18.714C10.208 18.7643 10.1049 18.7907 10 18.7907C9.89515 18.7907 9.79198 18.7643 9.7 18.714L2.825 14.9499C2.72683 14.8962 2.64488 14.8172 2.58772 14.721C2.53055 14.6248 2.50025 14.515 2.5 14.4031V6.92964C2.50025 6.81773 2.53055 6.70795 2.58772 6.61176C2.64488 6.51556 2.72683 6.43647 2.825 6.38276L9.7 2.6187C9.79198 2.56837 9.89515 2.54199 10 2.54199C10.1049 2.54199 10.208 2.56837 10.3 2.6187L17.175 6.38276C17.2732 6.43647 17.3551 6.51556 17.4123 6.61176C17.4695 6.70795 17.4997 6.81773 17.5 6.92964V14.4015C17.5 14.5137 17.4699 14.6238 17.4127 14.7203C17.3555 14.8168 17.2734 14.8961 17.175 14.9499Z'
          stroke={props.color ? props.color : '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.37207 4.44043L13.7502 8.47871V12.5412'
          stroke={props.color ? props.color : '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_2950_138679'>
          <rect width='20' height='20' fill='white' transform='translate(0 0.666016)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default OrdersIcon
