import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import getActiveProfile from '@utils/getActiveProfile'
import {safeParseInt} from 'utils/ConstFunctions'
import type {
  ApiResponseDoctorProfile,
  IDoctorProfileDetails,
} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'

type UseActiveProfileResult = {
  profileId: string | null
  activeProfile: IDoctorProfileDetails
  doctorData: ApiResponseDoctorProfile | null
  userDetail: ApiResponseDoctorProfile | null
  customerTrackingEnabled: boolean | null
}

const useActiveProfile = (): UseActiveProfileResult => {
  const {profileId, userDetail} = useContext(AuthContext)
  const doctorData = userDetail ?? null
  const profiles = doctorData?.profiles ?? []
  const activeProfile =
    profiles.length > 0
      ? getActiveProfile(profiles as IDoctorProfileDetails[], safeParseInt(profileId))
      : ({} as IDoctorProfileDetails)
  const customerTrackingEnabled =
    typeof activeProfile?.is_customer_tracking_enabled !== 'undefined'
      ? activeProfile.is_customer_tracking_enabled
      : null

  return {profileId, activeProfile, doctorData, userDetail: doctorData, customerTrackingEnabled}
}

export default useActiveProfile
