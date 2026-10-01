import React from 'react'

const Section = ({title, children}: {title: React.ReactNode; children: React.ReactNode}) => {
  return (
    <div className='w-full rounded-lg border border-lighterGray bg-white'>
      <div className='p-3 md:p-4'>
        {title ? (
          <h2 className='text-sm md:text-base font-semibold flex items-center gap-2 mb-4'>
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  )
}

export default Section
