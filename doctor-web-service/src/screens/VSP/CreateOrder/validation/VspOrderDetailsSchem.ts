import * as Yup from 'yup'

export const validationSchema = Yup.object({
  selected_product: Yup.string().required('Please Select a Product.'),
  oral_surgeon_name: Yup.string(),
  orthodontist_name: Yup.string(),
})
