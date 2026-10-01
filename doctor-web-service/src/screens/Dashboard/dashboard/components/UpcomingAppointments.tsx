import React from 'react'
import CalendarPage from 'screens/Calendar/CalendarPage'
import './UpcomingAppointments.css'
import {useNavigate} from 'react-router-dom'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import CaretRightIcon from 'assets/icons/CaretRightIcon'

const UpcomingAppointments = () => {
  const navigate = useNavigate()
  return (
    <BorderedCardForDashBoardCards>
      <div className='flex justify-between w-full'>
        <p className='font-semibold text-base'>Upcoming events</p>
        <button
          type='button'
          className='text-textColor text-sm font-semibold flex gap-2 items-center'
          onClick={() => {
            navigate('/calendar')
          }}
        >
          View all
          <CaretRightIcon color='#666666' />
        </button>
      </div>
      <div className='calendar-container'>
        <CalendarPage
          {...{
            showHeader: false,
          }}
        />
      </div>
    </BorderedCardForDashBoardCards>
  )
}

export default UpcomingAppointments
