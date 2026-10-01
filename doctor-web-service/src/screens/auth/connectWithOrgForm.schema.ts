import {
  ERROR_MAX_128_CHAR,
  ERROR_MIN_8_CHAR,
  ERROR_PASSWORD_FORMAT,
  ERROR_TERMS_AND_CONDITIONS,
} from 'utils/MessageConstant'
import * as Yup from 'yup'

export const schema = (skipPassword: boolean) =>
  Yup.object().shape({
    email: Yup.string(),
    password: skipPassword
      ? Yup.string().notRequired()
      : Yup.string()
          .required(ERROR_PASSWORD_FORMAT)
          .min(8, ERROR_MIN_8_CHAR)
          .max(128, ERROR_MAX_128_CHAR)
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)_\-=+\{\[\}\]\".,\/])[^\s]{8,}$/,
            ERROR_PASSWORD_FORMAT
          ),
    acceptTerms: Yup.boolean().oneOf([true], ERROR_TERMS_AND_CONDITIONS),
  })
