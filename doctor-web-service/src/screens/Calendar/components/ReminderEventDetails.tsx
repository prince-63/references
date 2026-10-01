import React from 'react'
import {useEvent} from './EventContext'
import hasValue from 'utils/hasValue'
import formatAmount from '../helpers/formatAmount'

const ReminderEventDetails = () => {
  const {event} = useEvent()
  const {amount, notes} = event.extendedProps.content.details
  const formattedAmount = formatAmount(amount)
  return (
    <div className='flex flex-col gap-3'>
      {hasValue(formattedAmount) && (
        <p className='text-black text-base font-semibold'>₹ {formattedAmount}</p>
      )}
      <div>
        <p className=' text-sm font-medium'>Notes</p>
        <p className='text-black text-sm'>{hasValue(notes) ? notes : 'No notes added'}</p>
      </div>
    </div>
  )
}

export default ReminderEventDetails
