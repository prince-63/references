import userTypes from '@constants/userTypes'
import {
  postApiDataLogin,
  setCaptchaChecked,
  setShowLockAccountModal,
  setShowLoginSessionModal,
  setShowRecaptcha,
} from 'redux/Slices/AuthSlice/loginSlice'
import {postApiDataLogoutOnSessionCall} from 'redux/Slices/AuthSlice/logoutOnSessionCall'
import {getDeviceDetails, identifyUser} from 'utils/ConstFunctions'
import {userSetup} from './userSetup.service'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import firebase from 'firebase/compat/app'
import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import {URL_SIGNUP_APPLE, URL_SIGNUP_GOOGLE} from 'redux/Endpoints/apiEndpoints'
import {setIsSocialLoggedInLoader} from 'redux/Slices/AppSlices/appStackStateSlice'
import getBrandConfig from 'utils/getBrandConfig'
import {getStorageType} from 'utils/storage'

interface ApiPostData {
  data: object // Define your POST request data type here
}

const getSocialOrganizationPayload = (redirectedData: any) => ({
  ...(redirectedData?.organization_id != null
    ? {organization_id: redirectedData.organization_id}
    : {}),
  ...(redirectedData?.profile_id != null ? {profile_id: redirectedData.profile_id} : {}),
})

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView: any
  }

export const manualLoginCall = async (
  dispatch: any,
  formik: any,
  clearData: () => void,
  shouldRetryOnSessionConflict: boolean = true,
  selection?: {
    organizationId?: number | string | null
    profileId?: number | string | null
  } | null
) => {
  const postData: ApiPostData = {
    data: {
      email: formik?.values?.email?.toLocaleLowerCase(),
      password: formik?.values?.password,
      device_info_details: getDeviceDetails(),
      user_type: userTypes.DOCTOR,
      org_name: getBrandConfig().brand,
      ...(selection?.organizationId ? {organization_id: selection.organizationId} : {}),
      ...(selection?.profileId ? {profile_id: selection.profileId} : {}),
    },
  }
  dispatch(postApiDataLogin(postData) as any)
    .unwrap()
    .then((res: any) => {
      window?.ReactNativeWebView?.postMessage(JSON.stringify(res))
      getStorageType().setItem('userToken', res?.token)
      userSetup(dispatch, res, clearData)
      identifyUser()
    })
    .catch((error: any) => {
      if (error === 'AL001') {
        dispatch(setShowLockAccountModal(true))
      } else if (error === 'AL002') {
        dispatch(setCaptchaChecked(false))
        formik.setFieldError('password', 'Your credentials do not match')
        dispatch(setShowRecaptcha(true))
      } else if (error === 'AS004') {
        formik.setFieldError('email', 'Email is not registered with us. Please sign up')
      } else if (error === 'AL003') {
        formik.setFieldError('password', 'Your credentials do not match')
      } else if (error === 'AD010') {
        formik.setFieldError(
          'email',
          'Email is registered with us through Google. Please log in through Google sign-in'
        )
      } else if (error === 'AL004') {
        if (!shouldRetryOnSessionConflict) return

        const logoutPostData: ApiPostData = {
          data: {
            device_info_details: getDeviceDetails(),
            email: formik?.values?.email?.toLocaleLowerCase(),
            ...(selection?.organizationId ? {organization_id: selection.organizationId} : {}),
            ...(selection?.profileId ? {profile_id: selection.profileId} : {}),
          },
        }

        dispatch(postApiDataLogoutOnSessionCall(logoutPostData) as any)
          .unwrap()
          .then(() => {
            dispatch(setShowLoginSessionModal(false))
            manualLoginCall(dispatch, formik, clearData, false, selection)
          })
          .catch((logoutError: any) => {
            console.error(logoutError)
          })
      } else if (error === 'AL006') {
        ErrorToast("This user doesn't exist. Please Signup")
      }
    })
}

export const googleLoginCall = async (
  dispatch: any,
  googleRedirectedData: any,
  clearData: () => void = () => {}
) => {
  const postData: any = {
    data: {
      token: googleRedirectedData.accessToken,
      email: googleRedirectedData?.email?.toLocaleLowerCase(),
      device_info_details: getDeviceDetails(),
      user_type: userTypes.DOCTOR,
      org_name: getBrandConfig().brand,
      ...getSocialOrganizationPayload(googleRedirectedData),
    },
  }
  try {
    const response = await apiHelper(URL_SIGNUP_GOOGLE, HttpMethod.POST, postData.data)
    if (response) {
      window?.ReactNativeWebView?.postMessage(JSON.stringify(response?.data))
      getStorageType().setItem('userToken', response?.data?.token)

      userSetup(dispatch, response?.data, clearData)
    }
  } catch (error: any) {
    dispatch(
      setIsSocialLoggedInLoader({
        isSocialLoggedInLoader: false,
      })
    )
    const error_code = error?.response?.data?.error_code
    if (error_code === 'AS004') {
      ErrorToast('Email is not registered with us. Please sign up.')
    } else if (error_code === 'AD010') {
      ErrorToast(
        'Email is registered with us. Please sign in manually entering your password and email.'
      )
    } else if (error_code === 'AL004') {
      // formik.setFieldValue('email', res?.email)
      // setShowLoginSessionModal(true)
    } else if (error === 'AL006') {
      ErrorToast("This user doesn't exist. Please Signup")
    }
    setTimeout(() => {
      getStorageType().setItem('loggedIn', 'false')
      window.location.href = '/login'
    }, 3000)
  }
}

export const appleLoginCall = async (
  dispatch: any,
  appleRedirectedData: any,
  clearData: () => void
) => {
  const postData: any = {
    data: {
      id_token: appleRedirectedData.accessToken,
      email:
        appleRedirectedData?.email != null ? appleRedirectedData?.email?.toLocaleLowerCase() : '',
      device_info_details: getDeviceDetails(),
      user_type: userTypes.DOCTOR,
      org_name: getBrandConfig().brand,
    },
  }
  try {
    const response = await apiHelper(URL_SIGNUP_APPLE, HttpMethod.POST, postData.data)
    if (response) {
      getStorageType().setItem('appleLoginDataLoader', 'false')
      window?.ReactNativeWebView?.postMessage(JSON.stringify(response?.data))
      getStorageType().setItem('userToken', response?.data?.token)

      userSetup(dispatch, response?.data, clearData)
    }
  } catch (error: any) {
    dispatch(
      setIsSocialLoggedInLoader({
        isSocialLoggedInLoader: false,
      })
    )
    getStorageType().setItem('appleLoginDataLoader', 'false')
    setTimeout(() => {
      window.location.href = '/login'
    }, 5000)
    const error_code = error?.response?.data?.error_code
    firebase
      .auth()
      .signOut()
      .then(function () {
        if (error_code === 'AS004') {
          ErrorToast('Email is not registered with us. Please sign up.')
        } else if (error_code === 'AD010') {
          ErrorToast(
            'Email is registered with us. Please sign in manually entering your password and email.'
          )
        } else if (error_code === 'AL004') {
          // formik.setFieldValue('email', res?.email)
          // setShowLoginSessionModal(true)
        } else if (error === 'AL006') {
          ErrorToast("This user doesn't exist. Please Signup")
        }
        setTimeout(() => {
          getStorageType().setItem('loggedIn', 'false')
          window.location.href = '/login'
        }, 3000)
      })
      .catch(function (error: any) {
        console.error(error)
      })
  }
}
