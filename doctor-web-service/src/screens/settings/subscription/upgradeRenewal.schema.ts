import defaultCountyCode from '@constants/defaultCountyCode'
import * as Yup from 'yup'

export const upgradeRenewalSchema = (countryCode: string) =>
  Yup.object().shape({
    mobile: Yup.string()
      .required('Please enter a valid mobile number')
      .min(
        countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 7,
        'Please enter a valid mobile number'
      ),
    request_type: Yup.string().required('Please select an option'),
    new_plan_name: Yup.string().notRequired(),
    notes: Yup.string().notRequired().nullable(),
  })
