import reminderTypeConstants from '@constants/reminderType.constants'
import * as yup from 'yup'

const addReminderValidationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  reminder_category: yup
    .mixed<keyof typeof reminderTypeConstants>()
    .required('Reminder category is required'),
  date: yup.string().required('Reminder date is required'),
  time: yup.string().required('Reminder time is required'),
  notes: yup.string(),
  amount: yup.string().when('reminder_category', (reminder_category, schema) => {
    return reminder_category[0] === 'PAYMENT_REMINDER'
      ? schema
          .required('Amount is required')
          .test('is-valid-number', 'Amount must be a valid number', function (value) {
            if (!value) return false
            const numericValue = parseFloat(value.replace(/,/g, ''))
            return !isNaN(numericValue)
          })
          .test('is-in-range', 'Please enter amount between ₹1 & ₹99,99,999', function (value) {
            if (!value) return false
            const numericValue = parseFloat(value.replace(/,/g, ''))
            return numericValue >= 1 && numericValue <= 9999999
          })
      : schema.notRequired()
  }),
  patient_id: yup
    .string()
    .test('required-patient', 'Patient is required', function (value) {
      const type = this.resolve(yup.ref('reminder_category'))
      if (type !== 'GENERAL_REMINDER') {
        return !!value
      }
      return true
    })
    .nullable(),
})

export default addReminderValidationSchema
