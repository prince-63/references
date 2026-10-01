import {IDoctorProfileDetails} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {safeParseInt} from 'utils/ConstFunctions'

export default (profiles: IDoctorProfileDetails[], profileId: number) => {
  return profiles.find((profile) => profile?.profile_id === safeParseInt(profileId))!
}
