import {useEvent} from './EventContext'

const SubscriptionEventDetails = () => {
  const {event} = useEvent()
  const {calendar_response_type} = event.extendedProps
  return (
    <div className='flex flex-col gap-3'>
      <div>
        <p className='text-black font-semibold text-base'>
          {calendar_response_type === 'BASIC_PLAN_EXPIRING'
            ? 'Starter plan will expire today'
            : 'Trial plan will expire today'}
        </p>
        <p>Upgrade your plan to keep using our features</p>
      </div>
      {/* <button
        type='button'
        className='rounded-lg px-2 py-2  flex justify-between items-center gap-2 text-sm  bg-primaryColor text-white w-fit'
        onClick={() => {
          navigate('/doctor-profile/subscription')
        }}
      >
        {calendar_response_type === 'BASIC_PLAN_EXPIRING' ? 'Manage plan' : 'Upgrade plan'}
      </button> */}
    </div>
  )
}

export default SubscriptionEventDetails
