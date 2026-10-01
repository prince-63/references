import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {URL_GET_DOCTOR_PROFILE, URL_GET_SUBSCRIPTION} from 'redux/Endpoints/apiEndpoints'
import firebase from 'firebase/compat/app'
import {identifyUser} from 'utils/ConstFunctions'
import {setIsSocialLoggedInLoader} from 'redux/Slices/AppSlices/appStackStateSlice'
import isTrialPlanAboutToExpire from '@utils/isTrialPlanAboutToExpire'
import isPlanAboutToExpire from '@utils/isPlanAboutToExpire'
import {ApiResponseDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {getStorageType} from 'utils/storage'
import brandNamesConstants from '@constants/brandNames.constants'
import {navigateToPortal} from '@utils/getPortalUrlByOrganization'
const brand = process.env.REACT_APP_BRAND_NAME || brandNamesConstants.DENTALSTACK

export const userSetup = async (dispatch: any, userData: any, clearData: () => void) => {
  try {
    const response = await apiHelper(URL_GET_DOCTOR_PROFILE + userData?.user_id, HttpMethod.GET)
    const userDetails: ApiResponseDoctorProfile = response?.data

    const subscriptionResponse = await apiHelper(
      `${URL_GET_SUBSCRIPTION}${userData?.user_id}/${userDetails?.default_profile?.profile_id}`,
      HttpMethod.GET
    )
    if (
      userDetails?.default_profile?.org_name === brand ||
      userDetails?.default_profile?.org_name === 'AMEND'
    ) {
      getStorageType().setItem('isGettingStartedOpen', 'true')
      getStorageType().setItem('userId', String(userData?.user_id))
      getStorageType().setItem('email', String(userData?.email)?.toLocaleLowerCase())
      getStorageType().setItem('userDetail', JSON.stringify(userDetails))
      getStorageType().setItem('userToken', userData?.token)
      getStorageType().setItem('userId', String(userData?.user_id))
      getStorageType().setItem('userDetail', JSON.stringify(userDetails))
      getStorageType().setItem('userToken', userData?.token)
      getStorageType().setItem('profileId', String(userDetails?.default_profile?.profile_id))
      getStorageType().setItem(
        'organizationId',
        String(userDetails?.default_profile?.organization_id)
      )
      getStorageType().setItem('subRoleId', String(userDetails?.default_profile?.subrole_id))
      getStorageType().setItem('lastRefreshTime', new Date().toISOString())
      firebase.auth().signOut()
      window.location.href = '/'
    } else {
      clearData()
      const portalUrl = navigateToPortal(userDetails?.default_profile?.org_name)
      const url = `${portalUrl}/cross-platform?userId=${encodeURIComponent(
        userData?.user_id ?? ''
      )}&profileId=${encodeURIComponent(userDetails?.default_profile?.profile_id ?? '')}&orgId=${encodeURIComponent(
        userDetails?.default_profile?.organization_id ?? ''
      )}&userToken=${encodeURIComponent(userData?.token ?? '')}`
      window.location.replace(url)
    }
    const userSubscriptionResponse = subscriptionResponse.data

    // @ts-ignore
    window.fcWidget.show()
    identifyUser()
    getStorageType().setItem('loggedIn', 'false')
    dispatch(
      setIsSocialLoggedInLoader({
        isSocialLoggedInLoader: false,
      })
    )
    if (isTrialPlanAboutToExpire(userSubscriptionResponse)) {
      getStorageType().setItem('trialPlanAboutToExpireModal', 'true')
      return
    }
    if (isPlanAboutToExpire(userSubscriptionResponse)) {
      getStorageType().setItem('planAboutToExpireModal', 'true')
      return
    }
  } catch (error: any) {
    dispatch(
      setIsSocialLoggedInLoader({
        isSocialLoggedInLoader: false,
      })
    )
    getStorageType().setItem('loggedIn', 'false')
    window.location.href = '/login'
    ErrorToast('The Server is facing some issues. Please try again later!')
    console.error(error)
    window.location.href = '/'
    getStorageType().setItem('googleLoginDataLoader', 'false')
    getStorageType().setItem('googleRegisterLoader', 'false')
    getStorageType().setItem('appleLoginDataLoader', 'false')
    getStorageType().setItem('appleRegisterLoader', 'false')
  }
}
