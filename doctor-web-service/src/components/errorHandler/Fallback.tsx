import React from 'react'
import serverBusy from 'assets/images/ServerBusy.png'
import clsx from 'clsx'

const Fallback = ({
  ifFromErrorPage = false,
  className = 'text-center items-center',
}: {
  ifFromErrorPage?: boolean
  className?: string
}) => {
  return (
    <div className='flex justify-center items-center flex-wrap gap-4 h-full'>
      <img src={serverBusy} alt='' className='h-[350px]' />
      <div className={clsx('flex flex-col pb-1', className)}>
        <div className='flex flex-col gap-1'>
          <p className='text-black font-medium text-2xl'>
            Server error, looks like we are facing some issues from our side
          </p>
          <p className='text-xl font-medium text-textColor'>
            Hang tight. We are working on the fix, the service will be up soon
          </p>
        </div>
        <div className='flex gap-4 items-end'>
          <button
            className=' bg-primaryColor text-white px-4 py-2 rounded-md mt-4'
            onClick={() => {
              if (ifFromErrorPage) {
                window.location.href = '/'
              } else {
                window.location.reload()
              }
            }}
          >
            {ifFromErrorPage ? 'Go to Dashboard' : 'Reload page'}
          </button>
          <a
            href='https://dental-stack.com/contact-us/'
            target='_blank'
            rel='noreferrer'
            className='text-primaryColor underline text-base font-semibold'
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  )
}

export default Fallback
