import * as Yup from 'yup'

export const billingSchema = () =>
  Yup.object().shape({
    companyLegalName: Yup.string().nullable(),
    address1: Yup.string().nullable(),
    address2: Yup.string().nullable(),
    country: Yup.string().nullable(),
    state: Yup.string().nullable(),
    city: Yup.string().nullable(),
    pincode: Yup.string().nullable(),
    companyTaxId: Yup.string().nullable(),
    currency: Yup.string().nullable(),
    companyProfilePicture: Yup.string().nullable(),
    companyDisplayName: Yup.string().nullable(),
  })
