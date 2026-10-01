import {useContext, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import InputEmail from '../../atom/Inputs/InputEmail'
import {Link} from 'react-router-dom'
import ForgotPassword from '../../modal/Auth/ModalForgotPassword'
import {useFormik} from 'formik'
import CommonSVG from '../../atom/SVG/CommonSVG'
import {SVG_APPLE, SVG_GOOGLE} from '../../../utils/SvgConstants'
import InputPasswordBar from '../../atom/Inputs/InputPasswordBar'

import ModalLockAccount from '../../modal/Auth/ModalLockAccount'
import ButtonDisable from '../../atom/Buttons/ButtonDisable'

import {ReCaptcha} from './ReCaptcha'
import {appleLoginCall, googleLoginCall, manualLoginCall} from '../services/login.service'
import {RootState} from 'redux/store'
import {
  getLoginProfilesByEmail,
  postLoginProfilesByEmailAndPassword,
  setCaptchaChecked,
  setShowLoginSessionModal,
} from 'redux/Slices/AuthSlice/loginSlice'
import Or from './Or'
import {loginSchema} from '../validations/validation'
import {IMAGE_LOGO} from 'utils/ImageConst'
import When from 'components/when/When'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {getDeviceDetails, identifyUser} from 'utils/ConstFunctions'
import {postApiDataLogoutOnSessionCall} from 'redux/Slices/AuthSlice/logoutOnSessionCall'
import {supabase} from 'services/supabase'
import hasValue from 'utils/hasValue'
import Page from 'components/page/Page'
import {getStorageType} from 'utils/storage'
import {setIsSocialLoggedInLoader} from 'redux/Slices/AppSlices/appStackStateSlice'
import getBrandConfig from 'utils/getBrandConfig'
import brandNamesConstants from '@constants/brandNames.constants'
import {AuthContext} from 'context/AuthContext'
import ModalLoginOrganizationSelect, {
  LoginOrganizationProfile,
} from 'components/modal/Auth/ModalLoginOrganizationSelect'

const brand = process.env.REACT_APP_BRAND_NAME

const initialValues = {
  email: '',
  password: '',
}

interface GoogleLoginPayload {
  accessToken?: string
  email?: string
  organization_id?: number | string | null
  profile_id?: number | string | null
}

export function Login() {
  const dispatch = useDispatch()
  const {clearData} = useContext(AuthContext)
  const [isForgetPasswordModalOpen, setIsForgetPasswordModalOpen] = useState(false)
  const {isSocialLoggedInLoader} = useSelector((state: RootState) => state.appStackState)
  const {loading, showLockAccountModal, captchaChecked, showRecaptcha} = useSelector(
    (state: RootState) => state.apiLogin
  )
  const [isGoogleLoginMethod, setIsGoogleLoginMethod] = useState(false)
  const [isAppleLoginMethod, setIsAppleLoginMethod] = useState(false)
  const [showOrganizationModal, setShowOrganizationModal] = useState(false)
  const [loginProfiles, setLoginProfiles] = useState<LoginOrganizationProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [pendingGoogleLoginPayload, setPendingGoogleLoginPayload] =
    useState<GoogleLoginPayload | null>(null)
  const effectRan = useRef(false)
  const googleLoginCalled = useRef(false) // Track if googleLoginCall has been called

  const normalizeLoginProfiles = (response: any): LoginOrganizationProfile[] => {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.results)) return response.results
    if (Array.isArray(response?.data?.results)) return response.data.results
    return []
  }

  const continueManualLogin = (selectedProfile?: LoginOrganizationProfile | null) => {
    manualLoginCall(dispatch, formik, clearData, true, {
      organizationId: selectedProfile?.organization_id ?? null,
      profileId: selectedProfile?.profile_id ?? null,
    })
  }

  const resetOrganizationModal = () => {
    setShowOrganizationModal(false)
    setLoginProfiles([])
    setSelectedProfileId(null)
    setPendingGoogleLoginPayload(null)
  }

  const closeOrganizationModal = () => {
    if (pendingGoogleLoginPayload) {
      getStorageType().setItem('loggedIn', 'false')
      dispatch(
        setIsSocialLoggedInLoader({
          isSocialLoggedInLoader: false,
        })
      )
    }
    resetOrganizationModal()
  }

  const continueGoogleLogin = (
    payload: GoogleLoginPayload,
    selectedProfile?: LoginOrganizationProfile | null
  ) => {
    googleLoginCall(
      dispatch,
      {
        ...payload,
        email: payload.email?.toLocaleLowerCase(),
        organization_id: selectedProfile?.organization_id ?? payload.organization_id ?? null,
        profile_id: selectedProfile?.profile_id ?? payload.profile_id ?? null,
      },
      clearData
    )
  }

  const resolveGoogleLoginOrganization = async (payload: GoogleLoginPayload) => {
    const normalizedEmail = payload.email?.toLocaleLowerCase()

    if (!normalizedEmail) {
      continueGoogleLogin(payload)
      return
    }

    try {
      const profilesResponse = await dispatch(getLoginProfilesByEmail(normalizedEmail) as any)
        .unwrap()
      const profiles = normalizeLoginProfiles(profilesResponse)

      if (profiles.length > 1) {
        setLoginProfiles(profiles)
        setSelectedProfileId(profiles[0]?.profile_id ?? null)
        setPendingGoogleLoginPayload({...payload, email: normalizedEmail})
        setShowOrganizationModal(true)
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
        return
      }

      continueGoogleLogin({...payload, email: normalizedEmail}, profiles[0] ?? null)
    } catch (error) {
      continueGoogleLogin({...payload, email: normalizedEmail})
    }
  }

  useEffect(() => {
    if (!effectRan.current) {
      const {data: authListener} = supabase.auth.onAuthStateChange(async (event, session) => {
        if (getStorageType().getItem('loggedIn') === 'true' && !googleLoginCalled.current) {
          googleLoginCalled.current = true

          if (hasValue(session)) {
            const user = session?.user
            const payload = {
              accessToken: session?.access_token,
              email: user?.email,
            }
            if (user?.app_metadata.provider === 'google') {
              await resolveGoogleLoginOrganization(payload)
            } else if (user?.app_metadata.provider === 'apple') {
              appleLoginCall(dispatch, payload, clearData)
            }
          } else {
            dispatch(
              setIsSocialLoggedInLoader({
                isSocialLoggedInLoader: false,
              })
            )
          }
        } else if (getStorageType().getItem('signedIn') === 'true') {
          window.location.href = `${window.location.origin}/registration`
        }
      })

      effectRan.current = true

      return () => {
        authListener.subscription.unsubscribe()
      }
    }
  }, [dispatch])

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async () => {
      setIsGoogleLoginMethod(false)
      setIsAppleLoginMethod(false)
      try {
        const payload = {
          email: formik.values.email?.toLocaleLowerCase() ?? '',
          password: formik.values.password ?? '',
        }
        const profilesResponse = await dispatch(
          postLoginProfilesByEmailAndPassword(payload) as any
        ).unwrap()
        const profiles = normalizeLoginProfiles(profilesResponse)

        if (profiles.length > 1) {
          setLoginProfiles(profiles)
          setSelectedProfileId(profiles[0]?.profile_id ?? null)
          setShowOrganizationModal(true)
          return
        }
        continueManualLogin(profiles[0] ?? null)
      } catch (error: any) {
        if (error === 'AL002') {
          formik.setFieldError('password', 'Your credentials do not match')
        } else if (error === 'AS004') {
          formik.setFieldError('email', 'Email is not registered with us. Please sign up')
        }
      }
    },
  })

  const callGoogleLogin = async () => {
    try {
      hasValue(getStorageType().setItem('loggedIn', 'true'))
      const {error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
          },
          redirectTo: `${window.location.origin}`, // Ensure this URL is correct
        },
      })
      if (error) {
      } else {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: true,
          })
        )
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const callAppleLogin = async () => {
    try {
      hasValue(getStorageType().setItem('loggedIn', 'true'))
      const {error} = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          queryParams: {
            prompt: 'select_account',
          },
          redirectTo: `${window.location.origin}`, // Ensure this URL is correct
        },
      })
      if (error) {
      } else {
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: true,
          })
        )
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const onClickLogOutLastSession = () => {
    const postData = {
      data: {
        device_info_details: getDeviceDetails(),
        email: formik.values.email?.toLowerCase(),
      },
    }
    dispatch(postApiDataLogoutOnSessionCall(postData) as any)
      .unwrap()
      .then(() => {
        dispatch(setShowLoginSessionModal(false))
        if (isGoogleLoginMethod) {
          callGoogleLogin()
        } else if (isAppleLoginMethod) {
          callAppleLogin()
        } else {
          formik.handleSubmit()
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
  }

  return (
    <Page loading={isSocialLoggedInLoader}>
      {isForgetPasswordModalOpen && (
        <ForgotPassword setIsForgetPasswordModalOpen={setIsForgetPasswordModalOpen} />
      )}
      {showOrganizationModal && (
        <ModalLoginOrganizationSelect
          profiles={loginProfiles}
          selectedProfileId={selectedProfileId}
          onSelect={setSelectedProfileId}
          onClose={closeOrganizationModal}
          onContinue={() => {
            const selectedProfile =
              loginProfiles.find((profile) => profile.profile_id === selectedProfileId) ?? null

            if (pendingGoogleLoginPayload) {
              const payload = pendingGoogleLoginPayload
              resetOrganizationModal()
              continueGoogleLogin(payload, selectedProfile)
              return
            }

            setShowOrganizationModal(false)
            continueManualLogin(selectedProfile)
          }}
        />
      )}
      {showLockAccountModal && <ModalLockAccount />}

      <When isTrue={true}>
        <form onSubmit={formik.handleSubmit}>
          <div className='items-center justify-center box-content '>
            <div className='w-full md:hidden'>
              <div className='flex mb-20 items-center justify-center'>
                <img className='w-[250px] mt-5' src={IMAGE_LOGO} alt='logo' />
              </div>
            </div>
            <div className='text-center text-black text-3xl font-bold '>Hello Again!</div>
            <p className='text-center text-textColor text-sm font-medium mt-3 '>
              Sign in to your {getBrandConfig().name} account to continue.
            </p>
            <div className='mt-10 gap-2'>
              <InputEmail
                name='email'
                className='w-full h-10 rounded-lg border border-mediumGray mt-1 '
                label='Email'
                classNameLabel='text-textColor text-base font-medium'
                formik={formik}
                required={true}
                placeHolder='Enter your email address'
              />
            </div>
            <div className='relative mt-4 gap-2'>
              <small
                className='text-textColor pt-2 cursor-pointer absolute right-0 z-30'
                onClick={() => setIsForgetPasswordModalOpen(true)}
              >
                Forgot password?
              </small>

              <InputPasswordBar
                name='password'
                className='w-full h-10 rounded-lg border border-mediumGray mt-1 '
                label='Password'
                classNameLabel='text-textColor text-base font-medium'
                formik={formik}
                required={true}
                isDisplaySubtext={false}
                placeHolder='Enter your password'
              />
            </div>
            {showRecaptcha && <ReCaptcha setCaptchaChecked={dispatch(setCaptchaChecked)} />}
            <div className='my-5'>
              {captchaChecked ? (
                <AntdButton
                  text={'Sign in'}
                  isDisabled={loading}
                  loading={loading}
                  htmlType='submit'
                />
              ) : (
                <ButtonDisable text='Sign in' />
              )}
            </div>

            <Or></Or>
            <div
              className='flex items-center border h-12 rounded-md hover:bg-mediumGray justify-center my-5 cursor-pointer'
              onClick={() => callGoogleLogin()}
            >
              <CommonSVG svg={SVG_GOOGLE} width='18' height='18' />
              <span className='text-sm ml-2'>Sign in with Google</span>
            </div>
            <div
              className='flex items-center border h-12 rounded-md hover:bg-mediumGray justify-center my-5 cursor-pointer'
              onClick={() => callAppleLogin()}
            >
              <CommonSVG svg={SVG_APPLE} width='18' height='18' />
              <span className='text-sm ml-2'>Sign in with Apple</span>
            </div>
            <When isTrue={brand === brandNamesConstants.DENTALSTACK}>
              <div className='text-center'>
                <span className='text-textColor text-sm font-normal'>
                  New to {getBrandConfig().name} ?{' '}
                </span>
                <Link
                  className='text-black text-sm underline cursor-pointer'
                  to={'/registration'}
                  onClick={() => {
                    identifyUser()
                  }}
                >
                  Sign up
                </Link>
              </div>
            </When>
          </div>
        </form>
      </When>
    </Page>
  )
}
