import * as Yup from 'yup'

export const schemaRemindPatient = Yup.object().shape({
  patients: Yup.array().min(1, 'Please select at least one patient').required('Required'),
  message: Yup.string()
    .max(500, 'Message cannot exceed 500 characters')
    .required('Message is required'),
})
