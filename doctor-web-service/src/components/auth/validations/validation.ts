import defaultCountyCode from '@constants/defaultCountyCode'
import {specialCharacters} from 'utils/ConstantValidations'
import {emailRegex} from 'utils/ConstFunctions'
import {
  ERROR_MAIL_FORMAT,
  ERROR_MIN_5_CHAR,
  ERROR_PASSWORD_FORMAT,
  ERROR_TERMS_AND_CONDITIONS,
  ERROR_MAX_200_CHAR,
  ERROR_MOBILE_FORMAT,
  ERROR_PASSWORD_LOGIN_FORMAT,
} from 'utils/MessageConstant'
import * as Yup from 'yup'

export const registrationStepOneSchema = Yup.object().shape({
  email: Yup.string().required('Email is required').matches(emailRegex, ERROR_MAIL_FORMAT),
  password: Yup.string()
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)_\-=+\{\[\}\]\".,\/])[^\s]{8,}$/,
      ERROR_PASSWORD_FORMAT
    ),
  acceptTerms: Yup.boolean().oneOf([true], ERROR_TERMS_AND_CONDITIONS),
})

export const registrationStepTwoSchema = (countryCode: string) => {
  return Yup.object().shape({
    firstName: Yup.string()
      .max(100, 'Please enter a first name with less than 100 characters.')
      .matches(specialCharacters, 'Please enter a valid first name')
      .required('First name is required')
      .test('no-only-spaces', 'Please enter a valid first name', (value) => {
        return !!value && value.trim() !== ''
      }),
    lastName: Yup.string()
      .max(100, 'Please enter a last name with less than 100 characters.')
      .matches(specialCharacters, 'Please enter a valid last name')
      .optional(),
    mobileNumber: Yup.string().min(
      countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 7,
      ERROR_MOBILE_FORMAT
    ),
  })
}

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email(ERROR_MAIL_FORMAT)
    .min(5, ERROR_MIN_5_CHAR)
    .max(200, ERROR_MAX_200_CHAR)
    .required('Email is required'),
  password: Yup.string().required(ERROR_PASSWORD_LOGIN_FORMAT),
})
