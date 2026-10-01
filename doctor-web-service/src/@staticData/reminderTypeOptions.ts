import reminderTypeConstants from '@constants/reminderType.constants'

export default [
  {
    value: reminderTypeConstants.GENERAL_REMINDER,
    label: 'General',
  },
  {
    value: reminderTypeConstants.APPOINTMENT_REMINDER,
    label: 'Appointment',
  },
  {
    value: reminderTypeConstants.PAYMENT_REMINDER,
    label: 'Payment',
  },
  {
    value: reminderTypeConstants.PRODUCTION_REMINDER,
    label: 'Production',
  },
  {
    value: reminderTypeConstants.TREATMENT_START_REMINDER,
    label: 'Treatment start',
  },

  {
    value: reminderTypeConstants.UNPROCESSED_ALIGNER_REMINDER,
    label: 'Unprocessed aligners',
  },
]
