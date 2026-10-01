import * as yup from 'yup'

export const OrderDetailsValidationSchema = yup.object().shape({
  lab_id: yup.number().required('Lab is required'),
  order_type: yup.string().required('Order type is required'),
})
