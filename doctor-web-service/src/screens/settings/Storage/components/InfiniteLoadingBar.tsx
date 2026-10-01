import React from 'react'

const InfiniteLoadingBar = ({title}: {title: string}) => {
  return (
    <div>
      <style>
        {`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            25% { transform: translateX(25%); }
            50% { transform: translateX(50%); }
            75% { transform: translateX(75%); }
            100% { transform: translateX(100%); }
          }

          .animate-loading-bar {
            animation: loading-bar 1.2s ease-in-out infinite;
          }
        `}
      </style>

      <div>
        <p className='text-sm text-textColor my-2'>{title}</p>
        <div className='w-full h-1.5 bg-lightGray overflow-hidden rounded-full'>
          <div className='h-full w-1/3 bg-primaryColor animate-loading-bar' />
        </div>
      </div>
    </div>
  )
}

export default InfiniteLoadingBar
