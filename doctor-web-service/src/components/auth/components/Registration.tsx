import {useContext, useEffect, useRef, useState} from 'react'
import InputEmail from '../../atom/Inputs/InputEmail'
import Button from '../../atom/Buttons/Button'
import InputPasswordBar from '../../atom/Inputs/InputPasswordBar'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import InputMobile from '../../atom/Inputs/InputMobile'
import InputText from '../../atom/Inputs/InputText'
import {useFormik} from 'formik'
import {TEXT_LOADING, TEXT_SIGN_ME_UP} from '../../../utils/MessageConstant'
import InputOtp from '../../atom/Inputs/InputOtp'
import {useDispatch, useSelector} from 'react-redux'
import {getStorageType} from 'utils/storage'
const brand = process.env.REACT_APP_BRAND_NAME || brandNamesConstants.DENTALSTACK

import ErrorToast from '../../modal/Alert/ErrorToast'
import {
  ApiGetData,
  checkButtonStates,
  getDeviceDetails,
  identifyUser,
} from '../../../utils/ConstFunctions'
import CommonSVG from '../../atom/SVG/CommonSVG'
import {SVG_APPLE, SVG_GOOGLE} from '../../../utils/SvgConstants'
import GoogleSignupAcceptsTerms from '../../modal/Auth/GoogleSignupAcceptsTerms'
import {
  getOrganizationDetails,
  postApiDataRegistrationStepOne,
  setIsRegistered,
} from '../../../redux/Slices/AuthSlice/registrationStepOneSlice'
import {authUpdateDetails} from '../../../redux/Slices/AuthSlice/signupLoginSlice'
import {
  postApiDataGoogleStepOne,
  setLoadingGoogleStepOne,
} from '../../../redux/Slices/AuthSlice/googleStepOneSlice'
import authStatus from '../../../@constants/authStatus'
import {postApiDataEmailOTPSlice} from '../../../redux/Slices/AuthSlice/emailOtpSentSlice'
import {postApiDataEmailOTPVerifySlice} from '../../../redux/Slices/AuthSlice/emailOTPVerifySlice'
import When from '../../when/When'
import TermsAndConditions from './TermsAndConditions'
import userTypes from '../../../@constants/userTypes'
import defaultCountyCode from '../../../@constants/defaultCountyCode'
import {ReCaptcha} from './ReCaptcha'
import hasValue from '../../../utils/hasValue'

import {registrationStepOneSchema, registrationStepTwoSchema} from '../validations/validation'
import AppleSignupAcceptsTerms from 'components/modal/Auth/AppleSignupAcceptsTerms'
import {
  postApiDataAppleStepOne,
  setLoadingAppleStepOne,
} from 'redux/Slices/AuthSlice/appleStepOneSlice'
import {supabase} from 'services/supabase'
import {setIsSocialLoggedInLoader} from 'redux/Slices/AppSlices/appStackStateSlice'
import Page from 'components/page/Page'
import {RootState} from 'redux/store'
import getBrandConfig from 'utils/getBrandConfig'
import {ConfigProvider, Input, Select, Space} from 'antd'
import {map} from 'ramda'
import salutations from '@staticData/salutations'
import AntdButton from 'components/atom/Buttons/AntdButton'
import clsx from 'clsx'
import {AuthContext} from 'context/AuthContext'
import brandNamesConstants from '@constants/brandNames.constants'
import {getAppBaseUrl} from 'utils/envUtils'

interface IGoogleUserData {
  accessToken: string
  email: string
  displayName: string
}

interface ApiPostData {
  data: object // Define your POST request data type here
}

const initialValues1 = {
  email: '',
  password: '',
  acceptTerms: false,
}

const initialValues2 = {
  firstName: '',
  lastName: '',
  mobileNumber: '',
  salutation: 'Dr',
}

export function Registration() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigation = useNavigate()

  const {isSocialLoggedInLoader} = useSelector((state: RootState) => state.appStackState)
  const {loading: emailOTpSentLoader} = useSelector((state: RootState) => state.emailOtpSent)

  const [showGoogleTerms, setShowGoogleTerms] = useState(false)
  const [showAppleTerms, setShowAppleTerms] = useState(false)
  const [buttonSignupText, setButtonSignupText] = useState(TEXT_SIGN_ME_UP)
  const [captchaChecked, setCaptchaChecked] = useState(false)

  const [emailOTP, setEmailOTP] = useState('')
  const [isOtpEmailSent, setIsOtpEmailSent] = useState(false)
  const [errorEmailMessage, setEmailErrorMessage] = useState('')
  const [isRegistrationOneDone, setIsRegistrationOneDone] = useState(
    location?.state?.registrationPart === 2 ? true : false
    // true
  )
  const baseUrl = getAppBaseUrl()

  const {currentCountryCode} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )

  const [googleIdToken, setGoogleIdToken] = useState('')
  const [appleIdToken, setAppleIdToken] = useState('')
  const [organizationId, setOrganizationId] = useState<number | string | null>(null)
  const isSubmittingRef = useRef(false)

  // Simple Step 1
  const formik1 = useFormik({
    initialValues: initialValues1,
    validationSchema: registrationStepOneSchema,
    onSubmit: async (values) => {
      if (isSubmittingRef.current) return
      isSubmittingRef.current = true

      const normalizedEmail = values.email.toLocaleLowerCase()

      let organization_id
      try {
        const organizationResponse = await dispatch(
          getOrganizationDetails({email: normalizedEmail}) as any
        ).unwrap()
        organization_id = organizationResponse?.organization_id
        setOrganizationId(organizationResponse?.organization_id ?? null)
      } catch (error: any) {
        ErrorToast(error || 'Unable to fetch organization details')
        isSubmittingRef.current = false
        return
      }

      const postData: ApiPostData = {
        data: {
          email: normalizedEmail,
          password: values.password,
          user_type: userTypes.DOCTOR,
          user_consent: true,
          org_name: getBrandConfig().brand,
          organization_id,
        },
      }
      dispatch(postApiDataRegistrationStepOne(postData) as any)
        .unwrap()
        .then((res: any) => {
          if (res?.skip_registration) {
            const postData: ApiGetData = {
              data: {
                email: res?.email.toLocaleLowerCase(),
                country_code: res?.country_code,
                mobile_no: res?.mobile_no,
                first_name: res?.first_name,
                last_name: res?.last_name,
                device_info_details: getDeviceDetails(),
                salutation: res?.salutation,
                token: googleIdToken,
                organization_id,
              },
            }
            navigation('/roles', {
              state: {
                postData,
                type: 'SIMPLE',
              },
            })
            return
          }
          setGoogleIdToken('')
          setAppleIdToken('')
          sentOtpEmail(organization_id)
          identifyUser()
        })
        .catch((error: any) => {
          if (error === 'AS003') {
            formik1.setFieldError('email', 'Email is already registered with us. Please sign in')
            ErrorToast('Email is already registered with us. Please sign in')
          }
          if (error === 'AS006') {
            formik1.setFieldError(
              'email',
              'Email is registered with us through Google. Please log in through Google sign-in'
            )
            ErrorToast(
              'Email is registered with us through Google. Please log in through Google sign-in'
            )
          }
        })
    },
  })

  const callGoogleRegistrationStepOne = async (googleResponse: IGoogleUserData) => {
    setGoogleIdToken(googleResponse.accessToken)
    const [firstName, lastName] = googleResponse?.displayName?.split(' ')
    const normalizedEmail = googleResponse.email.toLocaleLowerCase()
    let organization_id

    try {
      const organizationResponse = await dispatch(
        getOrganizationDetails({email: normalizedEmail}) as any
      ).unwrap()
      organization_id = organizationResponse?.organization_id
      setOrganizationId(organizationResponse?.organization_id ?? null)
    } catch (error: any) {
      ErrorToast(error || 'Unable to fetch organization details')
      dispatch(
        setIsSocialLoggedInLoader({
          isSocialLoggedInLoader: false,
        })
      )
      getStorageType().setItem('signedIn', 'false')
      return
    }

    const postData: ApiPostData = {
      data: {
        token: googleResponse.accessToken,
        email: normalizedEmail,
        user_type: userTypes.DOCTOR,
        device_info_details: getDeviceDetails(),
        org_name: getBrandConfig().brand,
        organization_id,
      },
    }
    dispatch(postApiDataGoogleStepOne(postData) as any)
      .unwrap()
      .then((res: any) => {
        if (res?.status === authStatus.IN_PROGRESS) {
          if (res?.skip_registration) {
            const postData: ApiGetData = {
              data: {
                email: res?.email.toLocaleLowerCase(),
                country_code: res?.country_code,
                mobile_no: res?.mobile_no,
                first_name: res?.first_name,
                last_name: res?.last_name,
                device_info_details: getDeviceDetails(),
                salutation: res?.salutation,
                org_name: getBrandConfig().brand,
                organization_id,
              },
            }
            navigation('/roles', {
              state: {
                postData,
                type: 'GOOGLE',
              },
            })
            return
          }
          dispatch(
            setIsSocialLoggedInLoader({
              isSocialLoggedInLoader: false,
            })
          )
          dispatch(setLoadingGoogleStepOne(false))
          setIsRegistrationOneDone(true)
          dispatch(setIsRegistered(true))
          formik1.setFieldValue('email', res?.email.toLocaleLowerCase())
          formik2.setFieldValue('firstName', firstName)
          formik2.setFieldValue('lastName', hasValue(lastName) ? lastName : '')
          getStorageType().setItem('signedIn', 'false')
        }
      })
      .catch((error: any) => {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
        getStorageType().setItem('signedIn', 'false')
        // window.location.href = '/registration'

        if (error === 'AS003') {
          ErrorToast('Email is already registered with us. Please sign in')
          formik1.setFieldError('email', 'Email is already registered with us. Please sign in')
        }
        if (error === 'AS006') {
          ErrorToast(
            'Email is registered with us through Google. Please log in through Google sign-in'
          )

          formik1.setFieldError(
            'email',
            'Email is registered with us through Google. Please log in through Google sign-in'
          )
        }
      })
  }

  const callAppleRegistrationStepOne = (appleResponse: IGoogleUserData) => {
    const [firstName, lastName] = appleResponse?.displayName?.split(' ')
    setAppleIdToken(appleResponse.accessToken)

    const postData: ApiPostData = {
      data: {
        id_token: appleResponse.accessToken,
        email: appleResponse?.email.toLocaleLowerCase(),
        user_type: userTypes.DOCTOR,
      },
    }
    dispatch(postApiDataAppleStepOne(postData) as any)
      .unwrap()
      .then((res: any) => {
        if (res?.status === authStatus.IN_PROGRESS) {
          if (res?.skip_registration) {
            const postData: ApiGetData = {
              data: {
                email: res?.email.toLocaleLowerCase(),
                country_code: res?.country_code,
                mobile_no: res?.mobile_no,
                first_name: res?.first_name,
                last_name: res?.last_name,
                device_info_details: getDeviceDetails(),
                salutation: res?.salutation,
                org_name: getBrandConfig().brand,
                organization_id: organizationId,
              },
            }
            navigation('/roles', {
              state: {
                postData,
                type: 'APPLE',
              },
            })
            return
          }
          dispatch(
            setIsSocialLoggedInLoader({
              isSocialLoggedInLoader: false,
            })
          )
          dispatch(setLoadingAppleStepOne(false))
          setIsRegistrationOneDone(true)
          dispatch(setIsRegistered(true))
          formik1.setFieldValue('email', res?.email.toLocaleLowerCase())
          formik2.setFieldValue('firstName', hasValue(firstName) ? firstName : '')
          formik2.setFieldValue('lastName', hasValue(lastName) ? lastName : '')
        }
      })
      .catch((error: any) => {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
        getStorageType().setItem('appleRegisterDataLoader', 'false')
        if (error === 'AS003') {
          ErrorToast('Email is already registered with us. Please sign in')
          formik1.setFieldError('email', 'Email is already registered with us. Please sign in')
        }
        if (error === 'AS006') {
          ErrorToast(
            'Email is registered with us through Apple. Please log in through Apple sign-in'
          )
          formik1.setFieldError(
            'email',
            'Email is registered with us through Apple. Please log in through Apple sign-in'
          )
        }
      })
  }

  useEffect(() => {
    const fetchSessionData = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession()

      if (hasValue(session)) {
        if (getStorageType().getItem('signedIn') === 'true') {
          const user = session?.user?.user_metadata
          const provider = session?.user?.app_metadata?.provider
          const payload: any = {
            accessToken: session?.access_token,
            email: user?.email.toLocaleLowerCase(),
            displayName: provider === 'google' ? user?.name : '',
          }
          if (provider === 'google') {
            callGoogleRegistrationStepOne(payload)
          } else if (provider === 'apple') {
            callAppleRegistrationStepOne(payload)
          }
        }
      } else {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
      }
    }
    fetchSessionData()
  }, [navigation])

  // Google Step 1
  const callGoogleSignUpStepOne = async () => {
    if (formik1.getFieldProps('acceptTerms').value) {
      try {
        getStorageType().setItem('signedIn', 'true')
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              prompt: 'select_account',
            },
            redirectTo: `${baseUrl}/registration`, // Ensure this URL is correct
          },
        })
      } catch (error) {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
        getStorageType().setItem('appleRegisterDataLoader', 'false')
        if (error === 'AS003') {
          ErrorToast('Email is already registered with us. Please sign in')
          formik1.setFieldError('email', 'Email is already registered with us. Please sign in')
        }
        if (error === 'AS006') {
          ErrorToast(
            'Email is registered with us through Apple. Please log in through Apple sign-in'
          )
          formik1.setFieldError(
            'email',
            'Email is registered with us through Apple. Please log in through Apple sign-in'
          )
        }
      }
    } else {
      setShowGoogleTerms(true)
    }
  }

  // Apple Step 1
  const callAppleSignUpStepOne = async () => {
    if (formik1.getFieldProps('acceptTerms').value) {
      try {
        getStorageType().setItem('signedIn', 'true')
        await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            queryParams: {
              prompt: 'select_account',
            },
            redirectTo: `${baseUrl}/registration`, // Ensure this URL is correct
          },
        })
      } catch (error) {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
        getStorageType().setItem('appleRegisterDataLoader', 'false')
        if (error === 'AS003') {
          ErrorToast('Email is already registered with us. Please sign in')
          formik1.setFieldError('email', 'Email is already registered with us. Please sign in')
        }
        if (error === 'AS006') {
          ErrorToast(
            'Email is registered with us through Apple. Please log in through Apple sign-in'
          )
          formik1.setFieldError(
            'email',
            'Email is registered with us through Apple. Please log in through Apple sign-in'
          )
        }
      }
    } else {
      setShowAppleTerms(true)
    }
  }

  // Email OTP
  const sentOtpEmail = (resolvedOrganizationId?: string | number | null) => {
    const postData: ApiGetData = {
      data: {
        email: formik1.values.email.toLocaleLowerCase(),
        user_type: userTypes.DOCTOR,
        org_name: getBrandConfig().brand,
        organization_id: resolvedOrganizationId ?? organizationId,
      },
    }

    dispatch(postApiDataEmailOTPSlice(postData) as any)
      .unwrap()
      .then(() => {
        setIsOtpEmailSent(true)
        identifyUser()
      })
      .catch((error: any) => {
        setIsOtpEmailSent(false)
        if (error.code === '400') {
          formik1.setFieldError('email', 'Email is already registered with us. Please sign in')
        }
      })
  }

  // Email OTP verify
  useEffect(() => {
    if (emailOTP.length == 4) {
      const postData: ApiGetData = {
        data: {
          email: formik1.values.email.toLocaleLowerCase(),
          otp: parseInt(emailOTP),
          user_type: userTypes.DOCTOR,
          org_name: getBrandConfig().brand,
          organization_id: organizationId,
        },
      }
      dispatch(postApiDataEmailOTPVerifySlice(postData) as any)
        .unwrap()
        .then(() => {
          setIsOtpEmailSent(false)
          setIsRegistrationOneDone(true)
          dispatch(setIsRegistered(true))

          identifyUser()
        })
        .catch((error: any) => {
          if (error?.error_code === 'AO002') {
            setEmailErrorMessage('Oops! Looks like you entered a wrong OTP')
          }
        })
    }
  }, [emailOTP])

  const schema2 = registrationStepTwoSchema(countryCode)

  // Simple Step 2
  const formik2 = useFormik({
    initialValues: initialValues2,
    validationSchema: schema2,
    onSubmit: async (values) => {
      setButtonSignupText(TEXT_LOADING)
      dispatch(
        authUpdateDetails({
          email: formik1.values?.email.toLocaleLowerCase(),
          country_code: countryCode,
          mobile_no: values.mobileNumber === '' ? null : values.mobileNumber,
          first_name: values.firstName.trim(),
          last_name: values.lastName?.trim(),
          salutation: values.salutation,
          org_name: getBrandConfig().brand,
          organization_id: organizationId,
        }) as any
      )
        .unwrap()
        .then(() => {
          if (googleIdToken == '' && appleIdToken == '') {
            const postData: ApiGetData = {
              data: {
                email: formik1.values?.email.toLocaleLowerCase(),
                country_code: countryCode,
                mobile_no: values.mobileNumber === '' ? null : values.mobileNumber,
                first_name: values.firstName,
                last_name: values.lastName,
                device_info_details: getDeviceDetails(),
                salutation: values.salutation,
                org_name: getBrandConfig().brand,
                organization_id: organizationId,
              },
            }
            navigation('/roles', {
              state: {
                postData,
                type: 'SIMPLE',
              },
            })
          } else {
            if (googleIdToken !== '') {
              const postData: ApiGetData = {
                data: {
                  email: formik1.values?.email.toLocaleLowerCase(),
                  mobile_no: values.mobileNumber === '' ? null : values.mobileNumber,
                  token: googleIdToken,
                  country_code: countryCode,
                  first_name: values.firstName,
                  last_name: values.lastName,
                  device_info_details: getDeviceDetails(),
                  salutation: values.salutation,
                  org_name: getBrandConfig().brand,
                  organization_id: organizationId,
                },
              }
              navigation('/roles', {
                state: {
                  postData,
                  type: 'GOOGLE',
                },
              })
            } else if (appleIdToken !== '') {
              const postData: ApiGetData = {
                data: {
                  email: formik1.values?.email?.toLocaleLowerCase(),
                  mobile_no: values.mobileNumber === '' ? null : values.mobileNumber,
                  token: appleIdToken,
                  country_code: countryCode,
                  first_name: values.firstName,
                  last_name: values.lastName,
                  device_info_details: getDeviceDetails(),
                  salutation: values.salutation,
                  org_name: getBrandConfig().brand,
                  organization_id: organizationId,
                },
              }
              navigation('/roles', {
                state: {
                  postData,
                  type: 'APPLE',
                },
              })
            }
          }
        })
        .catch((error: any) => {
          if (error.error_code === 'AS003') {
            formik2.setFieldError('mobileNumber', 'Mobile number already exists')
          }
          setButtonSignupText(TEXT_SIGN_ME_UP)
        })
    },
  })

  // Setting u Doctor details

  useEffect(() => {
    if (location?.state != null) {
      setGoogleIdToken(location?.state?.token)
      setAppleIdToken(location?.state?.token)
      formik1.setFieldValue('acceptTerms', true)
      formik1.setFieldValue('email', location?.state?.email?.toLocaleLowerCase())
      formik2.setFieldValue('firstName', location?.state?.firstName)
      formik2.setFieldValue('lastName', location?.state?.lastName)
    }
  }, [location?.state])

  useEffect(() => {
    if (formik1.getFieldProps('acceptTerms').value) {
      callGoogleSignUpStepOne()
    }
  }, [showGoogleTerms])

  useEffect(() => {
    if (formik1.getFieldProps('acceptTerms').value) {
      callAppleSignUpStepOne()
    }
  }, [showAppleTerms])

  useEffect(() => {
    if (brand !== brandNamesConstants.DENTALSTACK) {
      navigation('/login')
    }
  }, [])

  const {Option} = Select
  return (
    <Page loading={isSocialLoggedInLoader}>
      <When isTrue={showGoogleTerms}>
        <GoogleSignupAcceptsTerms
          name='acceptTerms'
          formik={formik1}
          checked={formik1.getFieldProps('acceptTerms').value}
          setShowGoogleTerms={setShowGoogleTerms}
        />
      </When>
      <When isTrue={showAppleTerms}>
        <AppleSignupAcceptsTerms
          name='acceptTerms'
          formik={formik1}
          checked={formik1.getFieldProps('acceptTerms').value}
          setShowAppleTerms={setShowAppleTerms}
        />
      </When>
      {!isRegistrationOneDone ? (
        <form onSubmit={formik1.handleSubmit}>
          <div className='items-center justify-center box-content'>
            <div className='block md:pt-10 lg:pt-6 xl:pt-4'>
              <div className='text-center text-black text-2xl font-bold mb-2 block '>
                Get started with {getBrandConfig().name}!
              </div>
              <div className='h-11 text-center text-textColor text-xs font-medium'>
                Explore {getBrandConfig().name}'s features by signing up for a free trial today!
              </div>

              <div className='relative md:mt-10 lg:mt-6 xl:mt-4'>
                <InputEmail
                  name='email'
                  className='w-full h-10 rounded-lg border border-mediumGray mt-1 px-10'
                  label='Email ID'
                  classNameLabel='text-textColor text-base font-medium'
                  formik={formik1}
                  required={true}
                  placeHolder='Enter your email address'
                />
              </div>

              <div>
                <InputPasswordBar
                  name='password'
                  className='w-full h-10 rounded-lg border border-mediumGray mt-1'
                  label='Password'
                  classNameLabel='text-textColor text-base font-medium'
                  formik={formik1}
                  required={true}
                  isDisplaySubtext={true}
                  placeHolder='Enter your password'
                />
              </div>

              <ReCaptcha setCaptchaChecked={setCaptchaChecked} />

              <div className='mt-8 flex font-family: Figtree text-sm'>
                <input
                  type='checkbox'
                  id={'acceptTerms'}
                  name={'acceptTerms'}
                  checked={formik1.values.acceptTerms}
                  onChange={formik1.handleChange}
                  onBlur={formik1.handleBlur}
                  className='min-w-[21px] min-h-[21px] mr-[7px] cursor-pointer green-checkbox'
                />
                <TermsAndConditions />
              </div>
              <div className='text-xs text-red mt-1'>
                {formik1.touched.acceptTerms && formik1.errors.acceptTerms && (
                  <div className='text-red'>{formik1.errors.acceptTerms}</div>
                )}
              </div>

              {isOtpEmailSent && (
                <div className='mt-4'>
                  <InputOtp
                    setOTP={setEmailOTP}
                    wrongOTP={errorEmailMessage.length > 0}
                    onClick={sentOtpEmail}
                    label='sent on your Email'
                  />
                  <div className='text-xs font-semibold text-red my-2'>{errorEmailMessage}</div>
                </div>
              )}
              <div className='mt-5'>
                <AntdButton
                  key='submit'
                  text={'Get OTP'}
                  htmlType='submit'
                  loading={emailOTpSentLoader}
                  disabled={emailOTpSentLoader || !captchaChecked || isOtpEmailSent}
                  className={clsx(
                    'h-12 w-full text-center',
                    emailOTpSentLoader || !captchaChecked || isOtpEmailSent
                      ? 'bg-mediumGray hover:!bg-mediumGray'
                      : 'bg-primaryColor'
                  )}
                />
              </div>
              <div className='flex flex-row items-center gap-2 mt-2'>
                <div className='w-full h-px rounded-sm border-b border-mediumGray' />
                <div className='text-center text-textColor text-sm font-semibold'>OR</div>
                <div className='w-full h-px rounded-sm border-b border-mediumGray' />
              </div>
              <div
                className='flex items-center border h-12 rounded-md hover:bg-lightGray hover:drop-shadow-lg justify-center flex-grow my-2 cursor-pointer'
                onClick={() => callGoogleSignUpStepOne()}
              >
                <CommonSVG svg={SVG_GOOGLE} width='18' height='18' />
                <span className='text-sm ml-2 '>Sign up with Google</span>
              </div>
              <div
                className='flex items-center border h-12 rounded-md hover:bg-lightGray hover:drop-shadow-lg justify-center flex-grow my-2 cursor-pointer'
                onClick={() => callAppleSignUpStepOne()}
              >
                <CommonSVG svg={SVG_APPLE} width='18' height='18' />
                <span className='text-sm ml-2 '>Sign up with Apple</span>
              </div>
              <div className='text-center'>
                <span className='text-textColor text-sm font-normal'>
                  Already there on {getBrandConfig().name}?{' '}
                </span>
                <Link to={'/login'} className='text-black text-sm font-medium underline'>
                  Login
                </Link>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className='w-full'>
          <form onSubmit={formik2.handleSubmit}>
            <div className='items-center justify-center box-content'>
              <div className='block pt-10'>
                <div className='text-center mb-14'>
                  <h1 className='text-2xl font-bold'>Let’s get you onboarded</h1>
                  <p className='text-textColor text-base font-medium'>
                    Simply add your details and sign up!
                  </p>
                </div>
                <label
                  className={'w-full text-bold text-textColor text-base font-medium'}
                  style={{color: '#666666'}}
                >
                  Your First Name
                  <span className='text-red ml-1'>*</span>
                </label>
                <ConfigProvider
                  theme={{
                    token: {fontFamily: 'figtree'},
                    components: {
                      Input: {
                        hoverBorderColor: 'inherit',
                        activeBorderColor: 'inherit',
                        activeShadow: 'none',
                      },
                      Select: {
                        hoverBorderColor: 'inherit',
                        activeBorderColor: 'inherit',
                        activeOutlineColor: 'inherit',
                      },
                    },
                  }}
                >
                  <Space.Compact className='w-full'>
                    <Select
                      value={formik2.values['salutation']}
                      className='h-12 focus:outline-none font-medium'
                      id='salutation'
                      popupMatchSelectWidth={false}
                      onChange={(v) => {
                        formik2.setFieldValue('salutation', v)
                      }}
                    >
                      {map(
                        (item) => (
                          <Option
                            key={`${item.label}-${item.value}`}
                            value={item.value}
                            selected={item.value === item.value}
                          >
                            {item.label}
                          </Option>
                        ),
                        salutations
                      )}
                    </Select>
                    <div className='w-full'>
                      <Input
                        value={formik2.values['firstName']}
                        className={'w-full px-2 h-12 border rounded  font-medium'}
                        onChange={formik2.handleChange}
                        id={'firstName'}
                        name={'firstName'}
                      />
                    </div>
                  </Space.Compact>
                </ConfigProvider>
                <div className='text-xs text-red mt-1'>
                  {formik2.touched['firstName'] && formik2.errors['firstName'] && (
                    <div className='text-red'>{formik2.errors['firstName']}</div>
                  )}
                </div>
                <div className='mt-4'>
                  <InputText
                    name='lastName'
                    className=''
                    label='Your Last Name'
                    classNameLabel='text-textColor text-base font-medium'
                    formik={formik2}
                    required={false}
                  />
                </div>
                <div className='relative mt-4'>
                  <InputMobile
                    name='mobileNumber'
                    className=''
                    label='Mobile Number'
                    classNameLabel='text-textColor text-base font-medium'
                    formik={formik2}
                    required={false}
                    countryCode={countryCode}
                    setCountryCode={setCountryCode}
                    value={formik2.values.mobileNumber}
                  />
                </div>

                <div className='mt-5'>
                  <Button
                    className='h-12'
                    text={buttonSignupText}
                    isDisabled={checkButtonStates(buttonSignupText)}
                    onClick={formik2.handleSubmit}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </Page>
  )
}
