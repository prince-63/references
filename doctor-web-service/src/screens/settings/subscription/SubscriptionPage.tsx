import React from 'react'
import ContainerWrapper from '../components/ContainerWrapper'
import {useNavigate} from 'react-router-dom'

import SubscriptionDetailsTile from 'components/subscription/SubscriptionDetailsTile'

const SubscriptionPage = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col gap-12 md:w-3/4'>
      <ContainerWrapper title='Subscription'>
        <div className='w-full flex justify-between flex-wrap items-center gap-3'>
          <div>
            <div className='font-medium'>Your plan</div>
            <div className='text-textColor text-sm font-normal'>
              View your plan details and usage.
            </div>
          </div>
          <div className='flex gap-2 '>
            <button
              className='w-[130px] text-primaryColor border border-primaryColor font-semibold rounded-lg h-10'
              onClick={() => navigate('/settings/upgrade-renew-subscription')}
            >
              Explore plans
            </button>
            <button
              className='w-[96px] bg-primaryColor text-white font-semibold rounded-lg h-10'
              onClick={() => navigate('/settings/upgrade-renew-subscription')}
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className='md:w-[370px]'>
          <SubscriptionDetailsTile />
        </div>
      </ContainerWrapper>
    </div>
  )
}

export default SubscriptionPage
