import {IconProps} from '../../types/IconProps'

const CheckRadioIcon = ({height, width, color}: IconProps) => {
  return (
    <svg
      width={width || '24'}
      height={height || '24'}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g id='Frame 1597882002'>
        <g id='Ellipse 1352' filter='url(#filter0_d_2276_12537)'>
          <circle cx='12' cy='12' r='6' fill={color || '#BE8901'} />
          <circle cx='12' cy='12' r='5' stroke='white' strokeWidth='2' />
        </g>
      </g>
      <defs>
        <filter
          id='filter0_d_2276_12537'
          x='3'
          y='3'
          width={width || '18'}
          height={height || '18'}
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feMorphology
            radius='3'
            operator='dilate'
            in='SourceAlpha'
            result='effect1_dropShadow_2276_12537'
          />
          <feOffset />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0.745098 0 0 0 0 0.537255 0 0 0 0 0.00392157 0 0 0 0.25 0'
          />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_2276_12537' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_2276_12537'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  )
}

export default CheckRadioIcon
