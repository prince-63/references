import React from 'react'

export type DashIconName =
  | 'users'
  | 'case'
  | 'ongoing'
  | 'month'
  | 'acceptance'
  | 'new_case'
  | 'approve_plan'
  | 'production'
  | 'clock'
  | 'alert'
  | 'warning'
  | 'message'
  | 'mail'

const DashIcon = ({name}: {name: DashIconName}) => {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const
  switch (name) {
    case 'users':
      return (
        <svg {...common}>
          <path d='M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2' />
          <circle cx='9' cy='7' r='4' />
          <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
          <path d='M16 3.13a4 4 0 0 1 0 7.75' />
        </svg>
      )
    case 'case':
      return (
        <svg {...common}>
          <path d='M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
          <path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2' />
        </svg>
      )
    case 'ongoing':
      return (
        <svg {...common}>
          <polyline points='22 12 18 12 15 21 9 3 6 12 2 12' />
        </svg>
      )
    case 'month':
      return (
        <svg {...common}>
          <rect x='3' y='4' width='18' height='18' rx='2' />
          <line x1='16' y1='2' x2='16' y2='6' />
          <line x1='8' y1='2' x2='8' y2='6' />
          <line x1='3' y1='10' x2='21' y2='10' />
        </svg>
      )
    case 'acceptance':
      return (
        <svg {...common}>
          <path d='M19 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z' />
          <path d='M10 14l2-2 4-4' />
        </svg>
      )
    case 'new_case':
      return (
        <svg {...common}>
          <rect x='4' y='4' width='16' height='16' rx='2' />
          <line x1='12' y1='8' x2='12' y2='16' />
          <line x1='8' y1='12' x2='16' y2='12' />
        </svg>
      )
    case 'approve_plan':
      return (
        <svg {...common}>
          <path d='M20 6L9 17l-5-5' />
        </svg>
      )
    case 'production':
      return (
        <svg {...common}>
          <circle cx='12' cy='12' r='3' />
          <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4' />
          <path d='M8 19.4A1.65 1.65 0 0 0 6.18 19l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15' />
          <path d='M4.6 9A1.65 1.65 0 0 0 5 6.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6' />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx='12' cy='12' r='10' />
          <polyline points='12 6 12 12 16 14' />
        </svg>
      )
    case 'alert':
      return (
        <svg {...common}>
          <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
          <line x1='12' y1='9' x2='12' y2='13' />
          <line x1='12' y1='17' x2='12.01' y2='17' />
        </svg>
      )
    case 'warning':
      return (
        <svg {...common}>
          <polygon points='12 2 22 20 2 20 12 2' />
          <line x1='12' y1='8' x2='12' y2='12' />
          <line x1='12' y1='16' x2='12.01' y2='16' />
        </svg>
      )
    case 'message':
      return (
        <svg {...common}>
          <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <path d='M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' />
          <polyline points='22,6 12,13 2,6' />
        </svg>
      )
  }
}

export default DashIcon
