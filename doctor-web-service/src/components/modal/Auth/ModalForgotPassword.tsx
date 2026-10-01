import {useFormik} from 'formik'
import * as Yup from 'yup'
import {useState, useEffect, useRef} from 'react'
import InputOtp from '../../atom/Inputs/InputOtp'
import InputPasswordBar from '../../atom/Inputs/InputPasswordBar'
import {
  ERROR_CONFIRM_PASSWORD,
  ERROR_EMAIL,
  ERROR_MAIL_FORMAT,
  ERROR_MAX_255_CHAR,
  ERROR_MAX_50_CHAR,
  ERROR_MIN_3_CHAR,
  ERROR_MIN_5_CHAR,
  ERROR_PASSWORD,
  ERROR_PASSWORD_FORMAT,
  ERROR_PASSWORD_NOT_MATCH,
} from '../../../utils/MessageConstant'
import {useDispatch} from 'react-redux'
import {
  ApiGetData,
  checkEmailIsValid,
  emailRegex,
  identifyUser,
} from '../../../utils/ConstFunctions'
import {postApiDataForgetPasswordOtpSend} from '../../../redux/Slices/AuthSlice/forgetPasswordOtpSentSlice'
import {
  clearDataForgetPasswordOtpVerify,
  postApiDataForgetPasswordOtpVerify,
} from '../../../redux/Slices/AuthSlice/forgetPasswordOtpVerifySlice'
import {
  clearDataForgetPasswordReset,
  postApiDataForgetPasswordReset,
} from '../../../redux/Slices/AuthSlice/forgetPasswordResetSlice'
import {getLoginProfilesByEmail} from '../../../redux/Slices/AuthSlice/loginSlice'
import SuccessToast from '../Alert/SuccessToast'
import ErrorToast from '../Alert/ErrorToast'
import {SVG_CROSS, SVG_RESET_PLANE, SVG_VERIFIED} from '../../../utils/SvgConstants'
import CommonSVG from '../../atom/SVG/CommonSVG'
import InputEmail from '../../atom/Inputs/InputEmail'
import DisabledButton from '../../atom/Buttons/DisabledButton'
import When from '../../when/When'
import userTypes from '../../../@constants/userTypes'
import {ReCaptcha} from '../../auth/components/ReCaptcha'
import getBrandConfig from 'utils/getBrandConfig'
import ModalLoginOrganizationSelect, {
  LoginOrganizationProfile,
} from 'components/modal/Auth/ModalLoginOrganizationSelect'
interface propsForgetPassword {
  setIsForgetPasswordModalOpen: any
}

const initialValues1 = {
  email: '',
}
const initialValues2 = {
  password: '',
  confirmPassword: '',
}
const schema1 = Yup.object().shape({
  email: Yup.string()
    .required(ERROR_EMAIL)
    .matches(
      /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/,
      'Please enter a valid email ID'
    )
    .email(ERROR_MAIL_FORMAT)
    .min(5, ERROR_MIN_5_CHAR)
    .matches(emailRegex, ERROR_MAIL_FORMAT)
    .max(255, ERROR_MAX_255_CHAR),
})

const schema2 = Yup.object().shape({
  password: Yup.string()
    .min(3, ERROR_MIN_3_CHAR)
    .max(50, ERROR_MAX_50_CHAR)
    .required(ERROR_PASSWORD)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)_\-=+\{\[\}\]\".,\/])[^\s]{8,}$/,
      ERROR_PASSWORD_FORMAT
    ),
  confirmPassword: Yup.string()
    .min(3, ERROR_MIN_3_CHAR)
    .max(50, ERROR_MAX_50_CHAR)
    .required(ERROR_CONFIRM_PASSWORD)
    .oneOf([Yup.ref('password')], ERROR_PASSWORD_NOT_MATCH),
})

const normalizeLoginProfiles = (response: any): LoginOrganizationProfile[] => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.data?.results)) return response.data.results
  return []
}

const ModalForgotPassword: React.FC<propsForgetPassword> = (props) => {
  const dispatch = useDispatch()
  const {setIsForgetPasswordModalOpen} = props
  const [messageOTPVerified, setMessageOTPVerified] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isOtpBox, setIsOtpBox] = useState(false)
  const [isEmailOTPVerified, setIsEmailOTPVerified] = useState(false)
  const [isShowNextStep, setIsShowNextStep] = useState(false)
  const [otp, setOTP] = useState('')
  const [wrongOTP, setWrongOTP] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [captchaChecked, setCaptchaChecked] = useState<boolean>(true)
  const [showOrganizationModal, setShowOrganizationModal] = useState(false)
  const [loginProfiles, setLoginProfiles] = useState<LoginOrganizationProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null)
  const isSubmittingRef = useRef(false)
  const brand = getBrandConfig()

  const formik1 = useFormik({
    initialValues: initialValues1,
    validationSchema: schema1,
    onSubmit: async () => {
      setIsShowNextStep(true)

      identifyUser()

      identifyUser()
    },
  })

  const handleForgetPasswordError = (error: any) => {
    if (error === 'AS004') {
      formik1.setFieldError('email', 'Email is not registered with us. Please sign up')
    } else if (error === 'AR004') {
      ErrorToast('Email is already registered with us. Please sign in using Google')
      setIsForgetPasswordModalOpen(false)
    } else if (error) {
      ErrorToast(error || 'Unable to fetch profile details')
    }
  }

  const closeOrganizationModal = () => {
    setShowOrganizationModal(false)
    setLoginProfiles([])
    setSelectedProfileId(null)
  }

  const sentOtpEmail = async () => {
    if (isSubmittingRef.current) return

    if (isOtpSent) {
      setIsOtpSent(false)
      setIsOtpBox(false)
      setIsEmailOTPVerified(false)
      setSelectedOrganizationId(null)
      return
    }

    isSubmittingRef.current = true
    try {
      const profilesResponse = await dispatch(
        getLoginProfilesByEmail(formik1.values.email?.toLocaleLowerCase()) as any
      ).unwrap()
      const profiles = normalizeLoginProfiles(profilesResponse)

      if (profiles.length > 1) {
        setLoginProfiles(profiles)
        setSelectedProfileId(profiles[0]?.profile_id ?? null)
        setShowOrganizationModal(true)
        return
      }

      if (profiles.length === 0) {
        formik1.setFieldError('email', 'Email is not registered with us. Please sign up')
        return
      }

      const organizationId = profiles[0]?.organization_id

      await otpAPICall(organizationId)
    } catch (error: any) {
      console.error(error)
      handleForgetPasswordError(error)
    } finally {
      isSubmittingRef.current = false
    }
  }

  const resendOTP = () => {
    if (!selectedOrganizationId) {
      ErrorToast('Unable to find organization details for this email')
      return
    }

    otpAPICall(selectedOrganizationId)
  }

  const otpAPICall = async (organizationId: number) => {
    const postData: ApiGetData = {
      data: {
        email: formik1.values.email?.toLocaleLowerCase(),
        user_type: userTypes.DOCTOR,
        org_name: brand.brand,
        organization_id: organizationId,
      },
    }
    return dispatch(postApiDataForgetPasswordOtpSend(postData) as any)
      .unwrap()
      .then(() => {
        SuccessToast(
          'OTP successfully sent to the email : ' +
            formik1.getFieldProps('email').value?.toLocaleLowerCase()
        )
        setSelectedOrganizationId(organizationId)
        setIsOtpSent(true)
        setIsOtpBox(true)
      })
      .catch((error: any) => {
        console.error(error)
        handleForgetPasswordError(error)
      })
  }

  const continueWithSelectedOrganization = () => {
    const selectedProfile =
      loginProfiles.find((profile) => profile.profile_id === selectedProfileId) ?? null

    if (!selectedProfile?.organization_id || isSubmittingRef.current) return

    isSubmittingRef.current = true
    closeOrganizationModal()
    otpAPICall(selectedProfile.organization_id).finally(() => {
      isSubmittingRef.current = false
    })
  }

  useEffect(() => {
    if (otp.length === 4) {
      const postData: ApiGetData = {
        data: {
          email: formik1.values.email?.toLocaleLowerCase(),
          otp: otp,
          user_type: userTypes.DOCTOR,
          organization_id: selectedOrganizationId,
        },
      }
      dispatch(postApiDataForgetPasswordOtpVerify(postData) as any)
        .unwrap()
        .then(() => {
          dispatch(clearDataForgetPasswordOtpVerify())
          setWrongOTP(false)
          setIsEmailOTPVerified(true)
          setIsOtpBox(false)
          setMessageOTPVerified('Otp verified successfully!')
        })
        .catch((error: any) => {
          console.error(error)
          if (error?.error_code == 'AO002') {
            setWrongOTP(true)
            setErrorMessage('Oops! Looks like you entered a wrong OTP')
          } else if (error?.error_code === '402') {
            setWrongOTP(true)
            setErrorMessage('OTP is expired')
          }
        })
    }
  }, [otp])

  // Reset Password
  const formik2 = useFormik({
    initialValues: initialValues2,
    validationSchema: schema2,
    onSubmit: async () => {
      const postData: ApiGetData = {
        data: {
          email: formik1.values.email?.toLocaleLowerCase(),
          new_password: formik2.values.password,
          user_type: userTypes.DOCTOR,
          organization_id: selectedOrganizationId,
        },
      }
      dispatch(postApiDataForgetPasswordReset(postData) as any)
        .unwrap()
        .then((res: any) => {
          if (!res.error) {
            SuccessToast('Congratulations! Your password reset was successful.')
            dispatch(clearDataForgetPasswordReset())
            setIsForgetPasswordModalOpen(false)
            identifyUser()
          }
        })
        .catch((error: any) => {
          if (error.error_code === 'AD010' || error.error_code === 'AR004') {
            ErrorToast('Mobile number is already registered with us. Please sign in using Google')
            setIsForgetPasswordModalOpen(false)
          }
        })
    },
  })

  useEffect(() => {
    setErrorMessage('')
    setWrongOTP(false)
  }, [otp])

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40 min-[876px]'
      tabIndex={-1}
    >
      <div className='bg-white w-96 rounded-lg p-6 shadow-lg min-w-[30%]'>
        <div className='flex flex-shrink-0 items-center justify-between rounded-t-md mt-4'>
          <CommonSVG svg={SVG_RESET_PLANE} width='50px' height='60px' />
          <button type='button' onClick={() => setIsForgetPasswordModalOpen(false)}>
            <CommonSVG svg={SVG_CROSS} width='38px' height='38px' />
          </button>
        </div>
        {/* Modal content */}
        <div className=''>
          <div className='text-black text-2xl font-semibold'>Verify your email</div>
          <div className='text-textColor text-base font-normal'>
            Enter your email to reset password
          </div>
        </div>
        <When isTrue={!isShowNextStep}>
          <form onSubmit={() => formik1.handleSubmit}>
            <div className='mt-6'>
              <div className='relative'>
                <InputEmail
                  name='email'
                  className='w-full h-10 rounded-lg border border-mediumGray mt-1 px-10'
                  label='Email ID'
                  classNameLabel='text-textColor text-base font-medium'
                  formik={formik1}
                  required={true}
                  placeHolder='Enter your email address'
                />
                <When isTrue={!isEmailOTPVerified}>
                  <>
                    <When isTrue={!isOtpSent}>
                      <button
                        className={`absolute top-[37px] right-2 transform-translate-y-1/2 cursor-pointer mt-1 text-sm font-bold ${
                          checkEmailIsValid(
                            formik1.getFieldProps('email').value?.toLocaleLowerCase()
                          )
                            ? 'text-primaryColor'
                            : 'text-mediumGray'
                        }`}
                        type='button'
                        disabled={
                          !checkEmailIsValid(
                            formik1.getFieldProps('email').value?.toLocaleLowerCase()
                          )
                        }
                        onClick={() => sentOtpEmail()}
                      >
                        Get OTP
                      </button>
                    </When>
                    <When isTrue={isOtpSent}>
                      <div className='absolute top-[37px] right-2 transform-translate-y-1/2 cursor-pointer mt-1 text-right text-tertiaryColor text-sm font-semibold'>
                        OTP Sent
                      </div>
                    </When>
                  </>
                </When>
                <When isTrue={isEmailOTPVerified}>
                  <div className='absolute top-[44px] right-2 transform-translate-y-1/2'>
                    <CommonSVG svg={SVG_VERIFIED} width='16' height='16' />
                  </div>
                </When>
              </div>

              <When isTrue={isOtpBox}>
                <InputOtp setOTP={setOTP} wrongOTP={wrongOTP} onClick={resendOTP} />
                <div className='text-xs font-semibold text-red my-2'>{errorMessage}</div>
              </When>

              <When isTrue={isEmailOTPVerified}>
                <div className='text-xs text-tertiaryColor mt-1'>{messageOTPVerified}</div>
              </When>

              <ReCaptcha setCaptchaChecked={setCaptchaChecked} />

              <div className='mt-4 flex justify-end'>
                {isEmailOTPVerified && captchaChecked ? (
                  <button
                    type='button'
                    onClick={() => formik1.handleSubmit()}
                    className='w-full h-12 flex items-center justify-center border rounded-md text-white text-sm bg-primaryColor drop-shadow-lg focus:outline-none'
                  >
                    Set new password
                  </button>
                ) : (
                  <DisabledButton
                    text='Set new password'
                    className='bg-grayDisabled text-textColor'
                  />
                )}
              </div>
            </div>
          </form>
        </When>

        <When isTrue={isShowNextStep}>
          <form onSubmit={() => formik2.handleSubmit}>
            <div className='mt-6'>
              <div className='mb-4'>
                <InputPasswordBar
                  name='password'
                  className='w-full h-10 rounded-lg border border-mediumGray mt-1'
                  label='New password'
                  classNameLabel='text-textColor text-base font-medium'
                  formik={formik2}
                  required={true}
                  isDisplaySubtext={false}
                />
              </div>
              <div className='mb-4'>
                <div></div>
                <InputPasswordBar
                  name='confirmPassword'
                  label='Confirm password'
                  classNameLabel='text-textColor text-lg font-medium'
                  className='w-full h-10 rounded-lg border border-mediumGray mt-1'
                  formik={formik2}
                  required={true}
                  isDisplaySubtext={true}
                />
              </div>
              <div className='mt-4 flex justify-end'>
                <button
                  type='button'
                  onClick={() => formik2.handleSubmit()}
                  className='w-full h-12 flex items-center justify-center border rounded-md text-white text-sm bg-primaryColor drop-shadow-lg focus:outline-none'
                >
                  Reset Password
                </button>
              </div>
            </div>
          </form>
        </When>
      </div>
      {showOrganizationModal && (
        <ModalLoginOrganizationSelect
          profiles={loginProfiles}
          selectedProfileId={selectedProfileId}
          onSelect={setSelectedProfileId}
          onClose={closeOrganizationModal}
          onContinue={continueWithSelectedOrganization}
        />
      )}
    </div>
  )
}

export default ModalForgotPassword
