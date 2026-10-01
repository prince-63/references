import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import AppointmentListItem from './AppointmentListItem'
import {Spin} from 'antd'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import NoAppointmentsFound from './NoAppointmentsFound'

const AppointmentsListMobileContainer = () => {
  const {appointmentsList, loadingAppointmentsList} = useSelector(
    (state: RootState) => state.appointments
  )
  return (
    <Spin spinning={loadingAppointmentsList}>
      <div className='flex flex-col gap-3 mb-3'>
        <When isTrue={hasValue(appointmentsList)}>
          {appointmentsList?.map((appointment) => (
            <AppointmentListItem key={appointment.appointment_id} appointment={appointment} />
          ))}
        </When>
        <When isTrue={!hasValue(appointmentsList)}>
          <NoAppointmentsFound />
        </When>
      </div>
    </Spin>
  )
}

export default AppointmentsListMobileContainer
