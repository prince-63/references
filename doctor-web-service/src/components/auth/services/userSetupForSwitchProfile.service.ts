import ErrorToast from 'components/modal/Alert/ErrorToast'
import firebase from 'firebase/compat/app'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {setIsSocialLoggedInLoader} from 'redux/Slices/AppSlices/appStackStateSlice'
import {
  ApiResponseDoctorProfile,
  getApiDataDoctorProfile,
} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {getStorageType} from 'utils/storage'

export const userSetupForSwitchProfileService = async (
  isLoggedIn: () => void,
  dispatch: any,
  token: string,
  targetUserId: string,
  targetProfileId?: string,
  targetOrgId?: string
) => {
  try {
    const postData = {
      doctor_id: safeParseInt(targetUserId),
    }
    dispatch(getApiDataDoctorProfile(postData) as any)
      .unwrap()
      .then((userDetails: ApiResponseDoctorProfile) => {
        getStorageType().setItem('isGettingStartedOpen', 'true')
        getStorageType().setItem('userId', String(targetUserId))
        getStorageType().setItem('email', String(userDetails?.email)?.toLocaleLowerCase())
        getStorageType().setItem('userDetail', JSON.stringify(userDetails))
        getStorageType().setItem('userToken', token)
        getStorageType().setItem('userId', String(targetUserId))
        getStorageType().setItem('userDetail', JSON.stringify(userDetails))
        getStorageType().setItem('userToken', token)
        getStorageType().setItem('profileId', String(targetProfileId))
        getStorageType().setItem('organizationId', String(targetOrgId))
        getStorageType().setItem('lastRefreshTime', new Date().toISOString())
        getStorageType().setItem('subRoleId', String(userDetails?.default_profile?.subrole_id))

        firebase.auth().signOut()
        isLoggedIn()
        window.location.href = '/'
        // @ts-ignore
        window.fcWidget.show()
        identifyUser()
        getStorageType().setItem('loggedIn', 'false')
        dispatch(
          setIsSocialLoggedInLoader({
            isSocialLoggedInLoader: false,
          })
        )
      })
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
