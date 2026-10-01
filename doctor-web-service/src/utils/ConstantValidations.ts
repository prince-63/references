import * as Yup from 'yup'
import {
  ERROR_MIN_2_CHAR,
  ERROR_MAX_255_CHAR,
  ERROR_PRACTICE_LOCATION_NAME,
  ERROR_MIN_10_CHAR,
  ERROR_MAX_500_CHAR,
  ERROR_PRACTICE_LOCATION_ADDRESS,
  ERROR_MAIL_FORMAT,
  ERROR_PRACTICE_LOCATION_WEBSITE_URL,
  ERROR_MAX_50_CHAR,
  ERROR_MAX_200_CHAR,
} from './MessageConstant'

export const specialCharacters = /^[a-zA-Z0-9!"#$£€%&'()*+,-–’./:;<=>?@[\]^_`{|}~ ]*$/
export const practiceLocationValidation = {
  practiceLocationName: Yup.string()
    .min(2, ERROR_MIN_2_CHAR)
    .max(255, ERROR_MAX_255_CHAR)
    .required(ERROR_PRACTICE_LOCATION_NAME),
  address: Yup.string()
    .min(10, ERROR_MIN_10_CHAR)
    .max(500, ERROR_MAX_500_CHAR)
    .required(ERROR_PRACTICE_LOCATION_ADDRESS),
  city: Yup.string().optional(),
  state: Yup.string().optional(),
  country: Yup.string().optional(),
  mobileNumber: Yup.string()
    .optional()
    .matches(/^\+?\d+$/, 'Please provide a valid mobile number'),
  emailId: Yup.string()
    .optional()
    .email(ERROR_MAIL_FORMAT)
    .matches(/\./, ERROR_MAIL_FORMAT)
    .max(50, ERROR_MAX_50_CHAR),
  websiteUrl: Yup.string()
    .optional()
    .max(200, ERROR_MAX_200_CHAR)
    .matches(
      /^(?!.*\s)((?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?:\/[^\s]*)?$/,
      ERROR_PRACTICE_LOCATION_WEBSITE_URL
    ),
  pincode: Yup.string()
    .matches(/^[0-9]+$/, 'Please enter digits (0-9) only')
    .optional(),
}
