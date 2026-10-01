import React from 'react'

const NotesIcon = ({color}: {color?: string}) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
      <path
        d='M11.6667 1.66675H5.00004C4.55801 1.66675 4.13409 1.84234 3.82153 2.1549C3.50897 2.46746 3.33337 2.89139 3.33337 3.33341V16.6667C3.33337 17.1088 3.50897 17.5327 3.82153 17.8453C4.13409 18.1578 4.55801 18.3334 5.00004 18.3334H15C15.4421 18.3334 15.866 18.1578 16.1786 17.8453C16.4911 17.5327 16.6667 17.1088 16.6667 16.6667V6.66675M11.6667 1.66675L16.6667 6.66675M11.6667 1.66675V6.66675H16.6667M13.3334 10.8334H6.66671M13.3334 14.1667H6.66671M8.33337 7.50008H6.66671'
        stroke={color ?? '#666666'}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default NotesIcon
