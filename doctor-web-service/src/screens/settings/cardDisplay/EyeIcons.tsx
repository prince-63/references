import React from 'react'

const Eye = ({
  className = 'w-5 h-5',
  stroke = 'currentColor',
}: {
  className?: string
  stroke?: string
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke={stroke}
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
)

const EyeOff = ({
  className = 'w-5 h-5',
  stroke = 'currentColor',
}: {
  className?: string
  stroke?: string
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke={stroke}
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.86 21.86 0 0 1 5.06-6.94' />
    <path d='M1 1l22 22' />
    <path d='M9.88 9.88A3 3 0 0 0 14.12 14.12' />
  </svg>
)

const EyeIcons: React.FC<{visible: boolean}> = ({visible}) => {
  return visible ? (
    <Eye className='w-5 h-5 text-green-600' />
  ) : (
    <EyeOff className='w-5 h-5 text-gray-400' />
  )
}

export default EyeIcons
