import {useMemo} from 'react'
import hasValue from 'utils/hasValue'
import {AppointmentListData} from '../appointments/types/appointments.types'
import processAppointmentListItem from '../appointments/utils/processAppointmentListItem'

const useMappedBracesNotes = ({appointments}: {appointments: AppointmentListData[]}) => {
  const mappedAppointments = useMemo(() => {
    if (!hasValue(appointments)) return []
    return appointments.map((appointment) => {
      const {upperJaw, lowerJaw, jawType} = processAppointmentListItem(appointment)
      return {
        start_date: appointment.start_date,
        end_date: appointment.end_date,
        jaw_type: jawType === 'BOTH' ? 'Both' : 'Separate',
        appointment_id: appointment.appointment_id,
        upperJaw,
        lowerJaw,
        status: appointment.status,
      }
    })
  }, [appointments])

  return mappedAppointments
}

export default useMappedBracesNotes
