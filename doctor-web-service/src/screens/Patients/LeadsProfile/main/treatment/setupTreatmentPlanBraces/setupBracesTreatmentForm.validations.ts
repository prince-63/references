import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  treatment_start_date: Yup.string().required('Please enter a treatment start date'),
  tentative_treatment_duration_in_months: Yup.number()
    .typeError('Must be a number')
    .min(1, 'Please enter a value between 1 to 99')
    .max(99, 'Please enter a value between 1 to 99')
    .required('Please enter a treatment duration'),

  upper_jaw_anchor_type_value: Yup.string().notRequired(),
  lower_jaw_anchor_type_value: Yup.string().notRequired(),
  extraction_remarks: Yup.string().notRequired(),
  remarks: Yup.string().notRequired(),
})
export default validationSchema
