import reminderTypeConstants from '@constants/reminderType.constants'
import {AddReminderFormValues} from '../addReminder.types'

export default ({
  initialValues,
  isOnPaymentsPage,
  isOnAppointmentsPage,
  patientId,
  isOnProductionPage,
  isOnBillingsAndPaymentsPage,
}: {
  initialValues?: AddReminderFormValues
  isOnPaymentsPage?: boolean
  patientId: number | null
  isOnAppointmentsPage?: boolean
  isOnBillingsAndPaymentsPage?: boolean
  isOnProductionPage?: boolean
}): AddReminderFormValues => {
  if (!initialValues) {
    const getReminderCategory = (): AddReminderFormValues['reminder_category'] => {
      if (isOnAppointmentsPage) {
        return reminderTypeConstants.APPOINTMENT_REMINDER
      }
      if (isOnPaymentsPage) {
        return reminderTypeConstants.PAYMENT_REMINDER
      }
      if (isOnProductionPage) {
        return reminderTypeConstants.PRODUCTION_REMINDER
      }
      if (isOnBillingsAndPaymentsPage) {
        return reminderTypeConstants.PAYMENT_REMINDER
      }
      return reminderTypeConstants.GENERAL_REMINDER
    }
    return {
      reminder_category: getReminderCategory(),
      date: '',
      time: '8:00 AM',
      title: '',
      notes: '',
      amount: '',
      patient_id:
        !isOnPaymentsPage &&
        !isOnAppointmentsPage &&
        !isOnProductionPage &&
        !isOnBillingsAndPaymentsPage
          ? null
          : patientId,
    }
  }
  return initialValues
}
