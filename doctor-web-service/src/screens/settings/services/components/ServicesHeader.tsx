import React from 'react'

export const ServicesHeader: React.FC = () => {
  return (
    <header>
      <h2 className='text-xl font-semibold'>Services</h2>
      <p className='text-gray-600 mt-2'>
        Your available services are managed automatically based on your current subscription.
        Checkboxes indicate which services are active for your account.
      </p>
    </header>
  )
}
