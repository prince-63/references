import defaultCountyCode from '@constants/defaultCountyCode'
import {emailRegex} from 'utils/ConstFunctions'
import {ERROR_MAIL_FORMAT, ERROR_MIN_5_CHAR, ERROR_MAX_200_CHAR} from 'utils/MessageConstant'
import * as Yup from 'yup'

export const labsSchema = (countryCode: string) =>
  Yup.object().shape({
    doctor_role: Yup.string().nullable(),
    first_name: Yup.string().nullable().required('First name is required'),
    last_name: Yup.string().nullable().notRequired(),
    email: Yup.string()
      .nullable()
      .email(ERROR_MAIL_FORMAT)
      .min(5, ERROR_MIN_5_CHAR)
      .max(200, ERROR_MAX_200_CHAR)
      .matches(emailRegex, ERROR_MAIL_FORMAT)
      .required(ERROR_MAIL_FORMAT),
    mobile_no: Yup.string()
      .nullable()
      .min(
        countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 7,
        'Please enter a valid mobile number'
      ),
    country_code: Yup.string().nullable(),

    salutation: Yup.string().nullable(),
  })
