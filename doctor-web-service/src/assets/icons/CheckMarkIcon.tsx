import {IconProps} from '../../types/IconProps'

const CheckMarkIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '18'}
      height={height || '18'}
      viewBox='0 0 11 9'
      fill='none'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.7904 0.706748C11.0699 0.982412 11.0699 1.42935 10.7904 1.70502L4.1124 8.29325C3.83298 8.56892 3.37994 8.56892 3.10052 8.29325L0.20957 5.44118C-0.0698512 5.16551 -0.0698512 4.71857 0.20957 4.44291C0.488992 4.16724 0.942024 4.16724 1.22145 4.44291L3.60646 6.79585L9.77856 0.706748C10.058 0.431084 10.511 0.431084 10.7904 0.706748Z'
        fill={color || 'black'}
      />
    </svg>
  )
}

export default CheckMarkIcon
