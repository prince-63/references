import {useMemo} from 'react'
import hasValue from 'utils/hasValue'
import {RowDataForAppointmentsList} from '../types/appointments.types'

const useMappedAppointmentsList = ({
  appointments,
}: {
  appointments: RowDataForAppointmentsList[]
}) => {
  const mappedAppointments = useMemo(() => {
    if (!hasValue(appointments)) return []
    return appointments.map((appointment) => appointment)
  }, [appointments])

  return mappedAppointments
}

export default useMappedAppointmentsList
