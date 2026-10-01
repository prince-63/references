import {IconProps} from 'types/IconProps'

const LabIcon = (props: IconProps) => {
  const {width, height, className, color} = props
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '21'}
      viewBox='0 0 20 21'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_8018_24597)'>
        <path
          d='M2.5 17.541H17.5'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M5.625 14.416H10.625'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10 2.54102H6.25C5.90482 2.54102 5.625 2.82084 5.625 3.16602V11.291C5.625 11.6362 5.90482 11.916 6.25 11.916H10C10.3452 11.916 10.625 11.6362 10.625 11.291V3.16602C10.625 2.82084 10.3452 2.54102 10 2.54102Z'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.625 6.29102C11.9368 6.29102 13.2153 6.70375 14.2794 7.47075C15.3436 8.23775 16.1395 9.32014 16.5543 10.5646C16.9691 11.809 16.9818 13.1525 16.5907 14.4046C16.1996 15.6567 15.4244 16.754 14.375 17.541'
          stroke={color || '#666666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_8018_24597'>
          <rect
            width={width || '20'}
            height={height || '20'}
            fill='white'
            transform='translate(0 0.666016)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default LabIcon
