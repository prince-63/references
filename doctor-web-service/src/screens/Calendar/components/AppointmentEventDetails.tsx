import React from 'react'
import PracticeLocationDetails from './PracticeLocationDetails'
import Notes from './Notes'
import AppointmentFooterButtons from './AppointmentFooterButtons'

const AppointmentEventDetails = () => {
  return (
    <div className='flex flex-col gap-3'>
      <PracticeLocationDetails />
      <Notes />
      <AppointmentFooterButtons />
    </div>
  )
}

export default AppointmentEventDetails
