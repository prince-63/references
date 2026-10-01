import {IconProps} from '../../types/IconProps'
import {clsx} from 'clsx'

const DropdownIcon = ({isActive, height, width, color, className}: IconProps) => {
  return (
    <div
      className={clsx(
        `${isActive ? 'rotate-180' : 'rotate-0'} transition-all duration-500`,
        className
      )}
    >
      <svg
        width={width || '11'}
        height={height || '6'}
        viewBox='0 0 11 6'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={className}
      >
        <path
          id='Vector'
          d='M0.246857 1.35343L4.91168 5.76985C5.06803 5.91726 5.27954 6 5.5 6C5.72046 6 5.93197 5.91726 6.08832 5.76985L10.7531 1.35343C10.8708 1.24273 10.9511 1.10129 10.9837 0.947153C11.0163 0.793016 10.9998 0.633161 10.9362 0.48797C10.8726 0.34278 10.7649 0.218831 10.6268 0.131927C10.4887 0.045022 10.3264 -0.000900775 10.1607 1.37916e-05L0.839349 1.33841e-05C0.673598 -0.000901197 0.511313 0.0450216 0.373188 0.131926C0.235063 0.218831 0.127355 0.342779 0.0637934 0.48797C0.000232931 0.633161 -0.0163 0.793015 0.0163033 0.947153C0.0489065 1.10129 0.129169 1.24273 0.246857 1.35343Z'
          fill={color || '#666666'}
        />
      </svg>
    </div>
  )
}

export default DropdownIcon
