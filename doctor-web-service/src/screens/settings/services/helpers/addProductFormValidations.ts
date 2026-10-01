import * as Yup from 'yup'

export const addProductFormValidationSchema = () =>
  Yup.object().shape({
    product: Yup.string().required('Product type is required'),
    name: Yup.string().required('Product name is required'),
    category: Yup.mixed().required('Category is required'),
    description: Yup.string().nullable(),
    photo: Yup.mixed().nullable(),
    enabled: Yup.boolean().required('Enabled is required'),
  })

export default addProductFormValidationSchema
