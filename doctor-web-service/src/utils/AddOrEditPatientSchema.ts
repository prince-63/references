import * as Yup from 'yup'
import {specialCharacters} from './ConstantValidations'
import defaultCountyCode from '@constants/defaultCountyCode'
import {
  ERROR_MAIL_FORMAT,
  ERROR_MAX_255_CHAR,
  ERROR_MIN_5_CHAR,
  ERROR_MOBILE_FORMAT,
} from './MessageConstant'
import {emailRegex} from './ConstFunctions'
import patientTypeSelectConstants from '@constants/patientTypeSelect.constants'

export const schema = ({countryCode}: {countryCode: string}) => {
  return Yup.object().shape({
    firstName: Yup.string()
      .max(100, 'Please enter a first name with less than 100 characters.')
      .matches(specialCharacters, 'Please enter a valid first name')
      .required('Please enter a valid name')
      .test('no-only-spaces', 'Please enter a valid first name', (value) => {
        return !!value && value.trim() !== ''
      }),
    lastName: Yup.string()
      .max(100, 'Please enter a last name with less than 100 characters.')
      .matches(specialCharacters, 'Please enter a valid last name')
      .optional(),
    mobileNumber: Yup.string()
      .min(
        countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 7,
        ERROR_MOBILE_FORMAT
      )
      .optional(),
    email: Yup.string()
      .min(5, ERROR_MIN_5_CHAR)
      .matches(
        /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/,
        'Please enter a valid email ID'
      )
      .matches(emailRegex, 'Please enter a valid email ID')
      .max(255, ERROR_MAX_255_CHAR)
      .email(ERROR_MAIL_FORMAT),
    practiceLocation: Yup.string().optional(),
    country: Yup.string().optional(),
    state: Yup.string().optional(),
    city: Yup.string().optional(),
    selectedPatientId: Yup.string().when('patientType', {
      is: patientTypeSelectConstants.SELECT_EXISTING_PATIENT,
      then: (schema) => schema.required('This field is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
  })
}
