import defaultCountyCode from '@constants/defaultCountyCode'
import {ERROR_MOBILE_FORMAT} from 'utils/MessageConstant'
import * as Yup from 'yup'
export const accountSchema = (countryCode: string) =>
  Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().nullable(),
    email: Yup.string(),
    displayName: Yup.string().nullable(),
    mobileNumber: Yup.string()
      .min(
        countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 7,
        ERROR_MOBILE_FORMAT
      )
      .nullable(),
  })
