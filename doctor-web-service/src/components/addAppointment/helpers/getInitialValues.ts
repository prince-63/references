import hasValue from 'utils/hasValue'
import {AddAppointmentFormValues} from '../addAppointment.types'

export default ({
  initialValues,
  isOnAppointmentsPage,
  practiceLocationId,
  patientId,
  endDate,
  now,
}: {
  initialValues?: AddAppointmentFormValues
  isOnAppointmentsPage?: boolean
  practiceLocationId?: number
  patientId: number | null
  now: string
  endDate: string
}): AddAppointmentFormValues => {
  if (!initialValues) {
    return {
      practice_location_id:
        isOnAppointmentsPage && hasValue(practiceLocationId) ? practiceLocationId : null,
      start_date: now,
      end_date: endDate,
      notes: '',
      amount: '',
      patient_id: isOnAppointmentsPage ? patientId : null,
    }
  }
  return initialValues
}
