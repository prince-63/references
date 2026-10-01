import ClockIcon from 'assets/icons/ClockIcon'
import React from 'react'
import {useOutletContext} from 'react-router-dom'
import {outletContext} from '../types/appointments.types'

const NoAppointmentsFound = () => {
  const {filter} = useOutletContext<outletContext>()
  const text = filter.ALL
    ? 'No appointments created yet'
    : filter.PAST
      ? 'No past appointments'
      : 'No upcoming appointments'
  return (
    <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-14rem)]'>
      <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
        <ClockIcon color='#666666' />
      </div>
      <p>{text}</p>
    </div>
  )
}

export default NoAppointmentsFound
