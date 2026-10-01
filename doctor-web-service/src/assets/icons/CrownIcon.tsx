const CrownIcon = ({color, height, width}: {color?: string; height?: string; width?: string}) => {
  return (
    <svg
      width={width || '20'}
      height={height || '12'}
      viewBox='0 0 20 12'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M0.5 0.0918002L5.21997 4.81177L10.0005 0.03125L14.7811 4.81177L19.5 0.0928202V8.96947C19.5 10.6264 18.1569 11.9695 16.5 11.9695H3.5C1.84314 11.9695 0.5 10.6264 0.5 8.96947V0.0918002ZM17.5 4.90907V8.96947C17.5 9.52177 17.0523 9.96947 16.5 9.96947H3.5C2.94771 9.96947 2.5 9.52177 2.5 8.96947V4.90807L5.21997 7.62807L10.0005 2.84754L14.7811 7.62807L17.5 4.90907Z'
        fill={color || '#BE8901'}
      />
    </svg>
  )
}

export default CrownIcon
