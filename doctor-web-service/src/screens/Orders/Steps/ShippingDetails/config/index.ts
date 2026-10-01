// shippingFormConfig.ts
import * as Yup from 'yup'

export const validationSchema = Yup.object({
  addressed_to: Yup.string()
    .min(2, 'Must Be at least 2 characters')
    .max(150, 'Must be 15 characters or less')
    .nullable(), // Optional

  name: Yup.string().min(2).max(150, 'Must be 150 characters or less').nullable(), // Optional

  mobile_number: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be at most 15 digits')
    .nullable(), // Optional

  address_line: Yup.string().nullable(), // Optional

  country: Yup.string().nullable(), // Optional

  state: Yup.string().nullable(), // Optional

  city: Yup.string().nullable(), // Optional

  pincode: Yup.string().nullable(), // Optional

  default: Yup.boolean(), // Optional
})
