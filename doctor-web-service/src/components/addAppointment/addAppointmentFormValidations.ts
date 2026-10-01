import * as yup from 'yup'

const addAppointmentFormValidations = yup.object().shape({
  start_date: yup.string().required('Start date and time is required'),
  end_date: yup
    .string()
    .required('End date and time is required')
    .test(
      'is-greater',
      'End date and time must be later than start date and time',
      function (value) {
        const {start_date} = this.parent
        return !start_date || !value || new Date(value) > new Date(start_date)
      }
    ),
  notes: yup.string(),
  patient_id: yup.number().required('Patient is required'),
  practice_location_id: yup.number().required('Practice location is required'),
})

export default addAppointmentFormValidations
