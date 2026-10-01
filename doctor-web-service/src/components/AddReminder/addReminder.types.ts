import reminderTypeConstants from '@constants/reminderType.constants'

export interface AddReminderFormValues {
  title?: string
  reminder_category?: keyof typeof reminderTypeConstants
  date?: string
  time?: string
  notes?: string
  amount?: string
  patient_id?: number | null
}
