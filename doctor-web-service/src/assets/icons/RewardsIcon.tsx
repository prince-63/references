const RewardsIcon = ({color, className}: {color: string; className?: string}) => {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke={color || '#666'}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <path d='M20 12v10H4V12' />
      <path d='M2 7h20v5H2z' />
      <path d='M12 22V7' />
      <path d='M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' />
      <path d='M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' />
    </svg>
  )
}

export default RewardsIcon
