/* eslint-disable @typescript-eslint/no-empty-function */
import React, {ReactNode, createContext, useState} from 'react'
import {store} from '../redux/store'
import {useNavigate} from 'react-router-dom'
import hasValue from '../utils/hasValue'
import {useDispatch} from 'react-redux'
import {setIsSocialLoggedInLoader} from 'redux/Slices/AppSlices/appStackStateSlice'
import {supabase} from 'services/supabase'
import {ApiResponseDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {getStorageType} from 'utils/storage'
import {useCurrentCountryCode} from '@hooks/useCurrentCountryCode'

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView: any
  }

interface AuthContextProps {
  registrationSetup: () => void
  login: () => void
  logout: () => void
  clearData: () => void
  userDetail: ApiResponseDoctorProfile | null
  userToken: string | null
  userId: string | null
  profileId: string | null
  organizationId: string | null
  subRoleId: string | null
  isLoading: boolean
  isLoggedIn: () => void
  demoModeStatus: boolean
  setDemoModeStatus: (x: boolean) => void
  currentCountryCode: string | null
}
export const AuthContext = createContext<AuthContextProps>({
  registrationSetup: () => {},
  login: () => {},
  logout: () => {},
  clearData: () => {},
  userDetail: null,
  userToken: null,
  userId: null,
  subRoleId: null,
  isLoading: false,
  isLoggedIn: () => {},
  demoModeStatus: false,
  setDemoModeStatus: () => {},
  profileId: null,
  organizationId: null,
  currentCountryCode: null,
})
interface AuthProviderProps {
  children: ReactNode
}
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [isLoading, setLoading] = React.useState(true)
  const [userToken, setUserToken] = React.useState<string | null>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [profileId, setProfileId] = React.useState<string | null>(null)
  const [organizationId, setOrganizationId] = React.useState<string | null>(null)
  const [subRoleId, setSubRoleId] = React.useState<string | null>(null)

  const [userDetail, setUserDetail]: any = useState(null)
  const [demoModeStatus, setDemoModeStatus]: any = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const currentCountryCode = useCurrentCountryCode()

  const registrationSetup = async () => {
    setLoading(true)
    const response: any = store.getState()?.apiDoctorProfileGet?.doctorData || {}

    if (response != null) {
      try {
        const userToken = String(getStorageType().getItem('userToken'))
        const userId = String(getStorageType().getItem('userId'))
        const profileId = String(getStorageType().getItem('profileId'))
        const organizationId = String(getStorageType().getItem('organizationId'))
        const subRoleId = String(getStorageType().getItem('subRoleId'))
        const userDetail = response
        getStorageType().setItem('userDetail', JSON.stringify(userDetail))
        setUserToken(userToken)
        setUserId(userId)
        setSubRoleId(subRoleId)
        setProfileId(profileId)
        setOrganizationId(organizationId)
        setUserDetail(userDetail)
        navigate('/brand-details')
        window.fcWidget.show()
      } catch (error) {
        console.error(error)
      }
    }
    setLoading(false)
  }

  const login = async () => {
    setLoading(true)
    const response: any = store.getState()?.apiDoctorProfileGet?.doctorData || {}

    if (response != null) {
      try {
        const userToken = String(getStorageType().getItem('userToken'))
        const userId = String(getStorageType().getItem('userId'))
        const profileId = String(getStorageType().getItem('profileId'))
        const organizationId = String(getStorageType().getItem('organizationId'))
        const subRoleId = String(getStorageType().getItem('subRoleId'))
        const userDetail = response
        getStorageType().setItem('userDetail', JSON.stringify(userDetail))
        setUserToken(userToken)
        setUserId(userId)
        setSubRoleId(subRoleId)
        setProfileId(profileId)
        setOrganizationId(organizationId)
        setUserDetail(userDetail)
        navigate('/', {
          replace: true,
          relative: 'path',
        })
        window.fcWidget.show()
      } catch (error) {
        console.error(error)
      }
    }
    setLoading(false)
  }
  const isLoggedIn = () => {
    try {
      setLoading(true)
      const userToken = String(getStorageType().getItem('userToken'))
      const userId = String(getStorageType().getItem('userId'))
      const profileId = String(getStorageType().getItem('profileId'))
      const organizationId = String(getStorageType().getItem('organizationId'))
      const subRoleId = String(getStorageType().getItem('subRoleId'))
      const userDetail: string = String(getStorageType().getItem('userDetail') ?? '')
      const userDetailObject = hasValue(userDetail) ? JSON.parse(userDetail) : {}
      if (userToken && userId && hasValue(userDetailObject) && hasValue(profileId)) {
        setUserToken(userToken)
        setUserId(userId)
        setProfileId(profileId)
        setOrganizationId(organizationId)
        setUserDetail(userDetailObject)
        setSubRoleId(subRoleId)
      }
      setLoading(false)
    } catch (error) {
      console.error('error', error)
    }
  }

  const removeAllLocalStorage = () => {
    getStorageType().clear()
    getStorageType().clear()
  }

  const logout = async () => {
    setUserToken(null)
    setUserId(null)
    setProfileId(null)
    setOrganizationId(null)
    setUserDetail(null)
    removeAllLocalStorage()
    navigate('/', {
      replace: true,
      relative: 'path',
    })
    setLoading(false)
    await supabase.auth.signOut()
    dispatch(
      setIsSocialLoggedInLoader({
        isSocialLoggedInLoader: false,
      })
    )
    window && window.fcWidget && window.fcWidget.hide()

    // Sending data from web to mobile application
    window?.ReactNativeWebView?.postMessage(JSON.stringify({logout: true}))
  }

  const clearData = async () => {
    setUserToken(null)
    setUserId(null)
    setProfileId(null)
    setOrganizationId(null)
    setUserDetail(null)
    removeAllLocalStorage()
    setLoading(false)
    await supabase.auth.signOut()
    dispatch(
      setIsSocialLoggedInLoader({
        isSocialLoggedInLoader: false,
      })
    )
    window && window.fcWidget && window.fcWidget.hide()

    // Sending data from web to mobile application
    window?.ReactNativeWebView?.postMessage(JSON.stringify({logout: true}))
  }

  React.useEffect(() => {
    isLoggedIn()
  }, [])
  return (
    <AuthContext.Provider
      value={{
        registrationSetup,
        login,
        logout,
        clearData,
        userToken,
        userId,
        userDetail,
        isLoading,
        isLoggedIn,
        demoModeStatus,
        setDemoModeStatus,
        profileId,
        organizationId,
        subRoleId,
        currentCountryCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
