import {IconProps} from 'types/IconProps'

interface CheckedCircleOutlineIconProps extends IconProps {
  withBorder?: boolean
}

const CheckedCircleOutlineIcon = ({
  width,
  height,
  color,
  withBorder = true,
}: CheckedCircleOutlineIconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '32'}
      height={height || '32'}
      viewBox='0 0 32 32'
      fill='none'
    >
      <path
        d='M11 17L14 20L21 13'
        stroke={color || '#00B383'}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      {withBorder && (
        <path
          d='M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z'
          stroke={color || '#00B383'}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      )}
    </svg>
  )
}

export default CheckedCircleOutlineIcon
