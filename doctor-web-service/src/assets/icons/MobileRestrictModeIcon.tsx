const MobileRestrictModeIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='200'
      height='141'
      viewBox='0 0 200 141'
      fill='none'
    >
      <g filter='url(#filter0_d_15065_25257)'>
        <rect x='16' y='4' width='168' height='109' rx='6' fill='white' />
        <rect x='16.5' y='4.5' width='167' height='108' rx='5.5' stroke='#E6E6E6' />
      </g>
      <path
        d='M22 4.5H178C181.038 4.5 183.5 6.96243 183.5 10V15.5H16.5V10C16.5 6.96243 18.9624 4.5 22 4.5Z'
        fill='#EFEFEF'
        stroke='#D9D9D9'
      />
      <path
        d='M26 36C26 34.8954 26.8954 34 28 34H54C55.1046 34 56 34.8954 56 36C56 37.1046 55.1046 38 54 38H28C26.8954 38 26 37.1046 26 36Z'
        fill='#D9D9D9'
      />
      <g opacity='0.4'>
        <path
          opacity='0.08'
          d='M26 54.5C26 52.567 27.567 51 29.5 51H170.5C172.433 51 174 52.567 174 54.5C174 56.433 172.433 58 170.5 58H29.5C27.567 58 26 56.433 26 54.5Z'
          fill='black'
        />
        <path
          opacity='0.05'
          d='M26 65.5C26 63.567 27.567 62 29.5 62H170.5C172.433 62 174 63.567 174 65.5C174 67.433 172.433 69 170.5 69H29.5C27.567 69 26 67.433 26 65.5Z'
          fill='black'
        />
        <path
          opacity='0.03'
          d='M26 76.5C26 74.567 27.567 73 29.5 73H170.5C172.433 73 174 74.567 174 76.5C174 78.433 172.433 80 170.5 80H29.5C27.567 80 26 78.433 26 76.5Z'
          fill='black'
        />
        <path
          opacity='0.02'
          d='M26 87.5C26 85.567 27.567 84 29.5 84H170.5C172.433 84 174 85.567 174 87.5C174 89.433 172.433 91 170.5 91H29.5C27.567 91 26 89.433 26 87.5Z'
          fill='black'
        />
      </g>
      <g opacity='0.5'>
        <rect opacity='0.6' x='20' y='8' width='4' height='4' rx='2' fill='black' />
        <rect opacity='0.25' x='27' y='8' width='4' height='4' rx='2' fill='black' />
        <rect opacity='0.15' x='34' y='8' width='4' height='4' rx='2' fill='black' />
      </g>
      <defs>
        <filter
          id='filter0_d_15065_25257'
          x='0'
          y='0'
          width='200'
          height='141'
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
            radius='8'
            operator='erode'
            in='SourceAlpha'
            result='effect1_dropShadow_15065_25257'
          />
          <feOffset dy='12' />
          <feGaussianBlur stdDeviation='12' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_15065_25257' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_15065_25257'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  )
}

export default MobileRestrictModeIcon
