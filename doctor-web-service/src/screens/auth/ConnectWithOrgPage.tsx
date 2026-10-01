import defaultCountyCode from '@constants/defaultCountyCode'
import userTypes from '@constants/userTypes'
import salutations from '@staticData/salutations'
import {Checkbox, ConfigProvider, Select, Space} from 'antd'
import LineBreakSvg from 'assets/icons/LineBreakSvg'
import {Image} from 'assets/images/Images/Image'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInput from 'components/atom/Inputs/FormikInput'
import InputMobile from 'components/atom/Inputs/InputMobile'
import InputOtp from 'components/atom/Inputs/InputOtp'
import InputPasswordBar from 'components/atom/Inputs/InputPasswordBar'
import {ReCaptcha} from 'components/auth/components/ReCaptcha'
import TermsAndConditions from 'components/auth/components/TermsAndConditions'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import When from 'components/when/When'
import {Formik, FormikHelpers} from 'formik'
import {map} from 'ramda'
import {useContext, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  postApiDataEmailOTPSlice,
  sendOtpForExistingUsers,
} from 'redux/Slices/AuthSlice/emailOtpSentSlice'
import {RootState} from 'redux/store'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import getColorPalette from 'utils/getColorPalette'
import hasValue from 'utils/hasValue'
import {schema} from './connectWithOrgForm.schema'
import getInitialValues from './helpers/getInitialValues'
import {getDeviceDetails, identifyUser} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {useParams} from 'react-router-dom'
import {getInviteDetails} from 'redux/Slices/AuthSlice/getInvitedDetails.slice'
import {
  setReactNativeSignupResponse,
  signUpOrLoginForConnectedOrgUser,
} from 'redux/Slices/AuthSlice/signupLoginSlice'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {AuthContext} from 'context/AuthContext'
import {postApiDataRegistrationStepOne} from 'redux/Slices/AuthSlice/registrationStepOneSlice'
import cn from '@utils/cn'
import {InviteDetails} from './inviteDetails.types'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_APPLE, SVG_GOOGLE} from 'utils/SvgConstants'
import {supabase} from 'services/supabase'
import {appleLoginCall, googleLoginCall} from 'components/auth/services/login.service'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import {getStorageType} from 'utils/storage'
import {userSetup} from 'components/auth/services/userSetup.service'

interface ConnectWithOrgPageForm {
  email: string
  password: string
  firstName: string
  lastName: string
  mobileNumber: string
  salutation: string
  acceptTerms: boolean
}

const ConnectWithOrgPage = () => {
  const {data, error} = useSelector((state: RootState) => state.inviteDetails)
  const {currentCountryCode, clearData} = useContext(AuthContext)
  const [countryCode, setCountryCode] = useState<string>(
    data?.country_code ?? currentCountryCode ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA
  )
  const {dispatchAction} = useDispatchAction()
  const {inviteId} = useParams()
  useEffect(() => {
    if (inviteId) {
      dispatchAction(getInviteDetails({id: inviteId}))
        .unwrap()
        .then((res: InviteDetails) => {
          setCountryCode(res.country_code ?? defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA)
        })
    }
  }, [inviteId])
  const [isOtpEmailSent, setIsOtpEmailSent] = useState(false)
  const isExistingUser = data?.registration_type === 'EXISTING_USER'
  const handleSubmit = async (
    values: ConnectWithOrgPageForm,
    formikHelpers: FormikHelpers<ConnectWithOrgPageForm>
  ) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    const postData = {
      data: {
        email: values.email?.toLocaleLowerCase(),
        user_type: userTypes.DOCTOR,
        organization_id: data?.organization_id,
      },
    }
    if (isExistingUser) {
      dispatch(sendOtpForExistingUsers(postData) as any)
        .unwrap()
        .then(() => {
          setIsOtpEmailSent(true)
        })
    } else {
      dispatch(
        postApiDataRegistrationStepOne({
          data: {
            email: values.email?.toLocaleLowerCase(),
            password: values.password,
            user_type: userTypes.DOCTOR,
            user_consent: true,
            organization_id: data?.organization_id,
          },
        }) as any
      )
        .unwrap()
        .then(() => {
          dispatch(postApiDataEmailOTPSlice(postData) as any)
            .unwrap()
            .then(() => {
              setIsOtpEmailSent(true)
            })
            .catch((error: any) => {
              setIsOtpEmailSent(false)
              if (error.code === '400') {
                formikHelpers.setFieldError('email', 'Please select the correct email address.')
              }
            })
        })
        .catch((error: any) => {
          if (error === 'AS003') {
            formikHelpers.setFieldError(
              'email',
              'Email is already registered with us. Please sign in'
            )
            ErrorToast('Email is already registered with us. Please sign in')
          }
          if (error === 'AS006') {
            formikHelpers.setFieldError(
              'email',
              'Email is registered with us through Google. Please log in through Google sign-in'
            )
            ErrorToast(
              'Email is registered with us through Google. Please log in through Google sign-in'
            )
          }
        })
    }
  }

  const {Option} = Select
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [emailOTP, setEmailOTP] = useState('')
  const [errorEmailMessage, setEmailErrorMessage] = useState('')
  const isSubmittingRef = useRef(false)
  const dispatch = useDispatch()
  const loginType = data?.credential_type
  const hasRun = useRef(0)

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      const payloadForUrlSignUp = JSON.parse(
        getStorageType().getItem('payloadForUrlSignUp') ?? '{}'
      )
      if (session && payloadForUrlSignUp && hasRun.current === 0) {
        hasRun.current += 1
        const user = session.user
        const payload = {
          accessToken: session.access_token,
          email: user?.email?.toLocaleLowerCase(),
          organization_id: payloadForUrlSignUp.organization_id,
          profile_id: payloadForUrlSignUp.profile_id,
        }

        const handleProviderLogin = async (
          provider: string,
          loginCall: (dispatch: any, payload: {accessToken: string; email: string}) => Promise<void>
        ) => {
          if (user?.email === payloadForUrlSignUp.email) {
            try {
              await dispatch(signUpOrLoginForConnectedOrgUser(payloadForUrlSignUp) as any).unwrap()
              loginCall(dispatch, payload)
              await supabase.auth.signOut()
            } catch (error) {
              console.error('Error during provider login:', error)
            }
          } else {
            AntdMessage({
              type: 'error',
              text: 'Email is not registered with us. Please sign up.',
            })
            await supabase.auth.signOut()
          }
        }

        if (user?.app_metadata.provider === 'google') {
          await handleProviderLogin('google', googleLoginCall)
        } else if (user?.app_metadata.provider === 'apple') {
          await handleProviderLogin('apple', appleLoginCall)
        }
      }
    }

    const {data: authListener} = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      authListener.subscription.unsubscribe()
      supabase.auth.signOut()
      getStorageType().removeItem('payloadForUrlSignUp')
    }
  }, [dispatch])
  return (
    <Formik
      initialValues={getInitialValues(data)}
      onSubmit={handleSubmit}
      validationSchema={schema(isExistingUser)}
      enableReinitialize
    >
      {(formik) => {
        useEffect(() => {
          if (emailOTP.length === 4) {
            const payload = {
              email: formik.getFieldProps('email').value?.toLocaleLowerCase(),
              user_type: userTypes.DOCTOR,
              otp: parseInt(emailOTP),
              first_name: formik.getFieldProps('firstName').value,
              last_name: formik.getFieldProps('lastName').value,
              mobile_no:
                formik.getFieldProps('mobileNumber').value === ''
                  ? null
                  : formik.getFieldProps('mobileNumber').value,
              country_code: countryCode,
              salutation: formik.getFieldProps('salutation').value,
              registration_type: data?.registration_type,
              invitation_code: inviteId,
              organization_id: data?.organization_id,
              doctor_id: data?.doctor_id,
              device_info_details: getDeviceDetails(),
              credential_type: loginType,
              brand: data?.brand,
            }

            dispatch(signUpOrLoginForConnectedOrgUser(payload) as any)
              .unwrap()
              .then((response: any) => {
                setIsOtpEmailSent(false)
                getStorageType().setItem('userToken', response.token)
                dispatch(setReactNativeSignupResponse(response))
                if (hasValue(getStorageType().getItem('userToken'))) {
                  userSetup(dispatch, response, clearData)
                }
              })
              .catch((error: any) => {
                if (error?.error_code === 'AO002') {
                  setEmailErrorMessage('Oops! Looks like you entered a wrong OTP')
                }
              })

            identifyUser()
          }
        }, [emailOTP])

        const handleOAuthLogin = async (provider: 'google' | 'apple') => {
          try {
            const {error} = await supabase.auth.signInWithOAuth({
              provider,
              options: {
                queryParams: {prompt: 'select_account'},
                redirectTo: `${window.location.origin}/${inviteId}/connect`,
              },
            })

            if (!error) {
              const payload = {
                email: formik.getFieldProps('email').value?.toLocaleLowerCase(),
                user_type: userTypes.DOCTOR,
                first_name: formik.getFieldProps('firstName').value,
                last_name: formik.getFieldProps('lastName').value,
                mobile_no: formik.getFieldProps('mobileNumber').value || null,
                country_code: countryCode,
                salutation: formik.getFieldProps('salutation').value,
                registration_type: data?.registration_type,
                invitation_code: inviteId,
                organization_id: data?.organization_id,
                doctor_id: data?.doctor_id,
                device_info_details: getDeviceDetails(),
                credential_type: loginType,
                otp: null,
                brand: data?.brand,
              }
              getStorageType().setItem('payloadForUrlSignUp', JSON.stringify(payload))
            }
          } catch (error) {
            console.error(`Error signing in with ${provider}:`, error)
          }
        }

        const callGoogleLogin = () => handleOAuthLogin('google')
        const callAppleLogin = () => handleOAuthLogin('apple')
        const sentOtpEmail = () => {
          const postData = {
            data: {
              email: formik.getFieldProps('email').value?.toLocaleLowerCase(),
              user_type: userTypes.DOCTOR,
              organization_id: data?.organization_id,
            },
          }
          if (isExistingUser) {
            dispatch(sendOtpForExistingUsers(postData) as any)
              .unwrap()
              .then(() => {
                setIsOtpEmailSent(true)
              })
          } else {
            dispatch(postApiDataEmailOTPSlice(postData) as any)
              .unwrap()
              .then(() => {
                setIsOtpEmailSent(true)
              })
              .catch((error: any) => {
                setIsOtpEmailSent(false)
                if (error.code === '400') {
                  formik.setFieldError(
                    'email',
                    'Email is already registered with us. Please sign in'
                  )
                }
              })
          }
        }
        return (
          <>
            <When isTrue={data?.status === 'PENDING'}>
              <div className='md:min-h-screen md:p-3  flex flex-col gap-6 justify-center text-textColor'>
                <div className='flex flex-col items-center gap-4'>
                  {hasValue(data?.organization_profile_url) ? (
                    <Image
                      className='w-10 h-10 rounded-[4px] object-cover cursor-pointer bg-transparent'
                      src={data?.organization_profile_url ?? ''}
                      alt='org photo'
                    />
                  ) : (
                    <PatientProfileInitials
                      {...{
                        name: data?.organization_name ?? '',
                        className: cn('min-w-10 min-h-10 rounded-[4px]'),
                      }}
                    />
                  )}
                  <p className='text-black font-semibold text-2xl'>
                    Connect with {data?.organization_name}
                  </p>
                </div>

                <ConfigProvider
                  theme={{
                    token: {fontFamily: 'figtree', colorPrimary: getColorPalette().primaryColor},
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
                  <div className='flex flex-col gap-4 '>
                    <div className='flex gap-4'>
                      <div className='w-full'>
                        <label
                          className={'w-full text-bold text-textColor text-base font-medium'}
                          style={{color: '#666666'}}
                        >
                          First Name
                          <span className='text-red ml-1'>*</span>
                        </label>
                        <Space.Compact className='w-full'>
                          <Select
                            value={formik.values['salutation']}
                            disabled
                            className='h-12 focus:outline-none font-medium'
                            id='salutation'
                            onChange={(v) => {
                              formik.setFieldValue('salutation', v)
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
                            <FormikInput
                              name={'firstName'}
                              required
                              className='h-12'
                              maxLength={50}
                              readOnly={isExistingUser}
                            />
                          </div>
                        </Space.Compact>
                      </div>
                      <FormikInput
                        name={'lastName'}
                        label={'Last name'}
                        className='h-12'
                        maxLength={50}
                      />
                    </div>
                    <InputMobile
                      name='mobileNumber'
                      className=''
                      label='Mobile Number'
                      classNameLabel='text-textColor text-base font-medium'
                      formik={formik}
                      required={false}
                      countryCode={countryCode}
                      setCountryCode={setCountryCode}
                      value={formik.values.mobileNumber}
                    />
                    <FormikInput
                      name={'email'}
                      label={'Email '}
                      className='h-12'
                      maxLength={50}
                      readOnly
                    />
                    <When isTrue={data?.registration_type === 'NEW_USER_INVITED'}>
                      <InputPasswordBar
                        name='password'
                        className='w-full h-10 rounded-lg border border-mediumGray mt-1 text-black'
                        label='Password'
                        classNameLabel='text-textColor text-base font-medium'
                        formik={formik}
                        required={true}
                        isDisplaySubtext={true}
                        placeHolder='Enter your password'
                      />
                    </When>
                    {isOtpEmailSent && (
                      <div className='mt-4'>
                        <InputOtp
                          setOTP={setEmailOTP}
                          wrongOTP={errorEmailMessage.length > 0}
                          onClick={sentOtpEmail}
                          label='sent on your Email'
                        />
                        <div className='text-xs font-semibold text-red my-2'>
                          {errorEmailMessage}
                        </div>
                      </div>
                    )}
                  </div>
                  <ReCaptcha className='my-0' setCaptchaChecked={setCaptchaChecked} />
                  <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                      <Checkbox
                        checked={formik.values.acceptTerms}
                        onChange={(e) => formik.setFieldValue('acceptTerms', e.target.checked)}
                      />
                      <TermsAndConditions />
                    </div>
                    <div className='text-xs text-red mt-1'>
                      {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                        <div className='text-red'>{formik.errors.acceptTerms}</div>
                      )}
                    </div>
                  </div>
                  <InfoCard
                    {...{
                      showButton: false,
                      className: 'border border-primaryColor bg-primarySupport py-2',
                      titleClassName: 'font-semibold text-xs md:text-sm',
                      title: 'If your details are incorrect, you may contact your provider.',
                    }}
                  />
                  <When isTrue={loginType === 'PASSWORD' || loginType === 'NONE'}>
                    <AntdButton
                      htmlType='submit'
                      text={'Get OTP'}
                      loading={false}
                      disabled={!captchaChecked || !formik.values.acceptTerms}
                      onClick={() => formik.handleSubmit()}
                    />
                  </When>
                  <div>
                    <When isTrue={loginType === 'GOOGLE_TOKEN'}>
                      <button
                        className={cn(
                          'flex items-center border h-12 w-full rounded-md hover:bg-mediumGray justify-center my-5 cursor-pointer',
                          (!captchaChecked || !formik.values.acceptTerms) && 'opacity-50'
                        )}
                        type='button'
                        disabled={!captchaChecked || !formik.values.acceptTerms}
                        onClick={() => {
                          callGoogleLogin()
                        }}
                      >
                        <CommonSVG svg={SVG_GOOGLE} width='18' height='18' />
                        <span className='text-sm ml-2'>Sign in with Google</span>
                      </button>
                    </When>
                    <When isTrue={loginType === 'APPLE_TOKEN'}>
                      <button
                        className={cn(
                          'flex items-center border h-12 w-full rounded-md hover:bg-mediumGray justify-center my-5 cursor-pointer',
                          (!captchaChecked || !formik.values.acceptTerms) && 'opacity-50'
                        )}
                        type='button'
                        disabled={!captchaChecked || !formik.values.acceptTerms}
                        onClick={() => {
                          callAppleLogin()
                        }}
                      >
                        <CommonSVG svg={SVG_APPLE} width='18' height='18' />
                        <span className='text-sm ml-2'>Sign in with Apple</span>
                      </button>
                    </When>
                  </div>
                </ConfigProvider>
              </div>
            </When>
            <When
              isTrue={
                data?.status === 'EXPIRED' ||
                data?.status === 'ACCEPTED' ||
                error?.error_code === 'IN0002' ||
                error?.error_code === null
              }
            >
              <div className='flex flex-col gap-6 text-textColor text-base justify-center items-center md:h-[calc(100vh-14rem)] h-[calc(100vh-23.5rem)]'>
                <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
                  <LineBreakSvg />
                </div>
                <div className='text-base flex flex-col  justify-center items-center'>
                  <p className='text-2xl font-semibold text-black'>Link expired</p>
                  <p className=''>This link is no longer valid.</p>
                </div>
                <InfoCard
                  {...{
                    showButton: false,
                    className: 'border border-primaryColor bg-primarySupport py-2',
                    titleClassName: 'font-medium text-xs md:text-sm',
                    title: `Please contact your ${
                      error?.error_code === null ? 'admin' : 'organization'
                    } to request a new invite link`,
                  }}
                />
              </div>
            </When>
          </>
        )
      }}
    </Formik>
  )
}

export default ConnectWithOrgPage
