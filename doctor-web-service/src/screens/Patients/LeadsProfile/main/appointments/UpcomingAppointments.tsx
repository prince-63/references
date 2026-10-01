import TableContainerForAppointmentsList from './components/TableContainerForAppointmentsList'
import AppointmentsListMobileContainer from './components/AppointmentsListMobileContainer'

const UpcomingAppointments = () => {
  return (
    <div className=''>
      <div className='hidden md:block'>
        <TableContainerForAppointmentsList />
      </div>
      <div className='md:hidden block'>
        <AppointmentsListMobileContainer />
      </div>
    </div>
  )
}

export default UpcomingAppointments
