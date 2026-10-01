import patientAssignedTypeConstants from '@constants/patientAssignedType.constants'
import {PatientDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {safeParseInt} from 'utils/ConstFunctions'

export default (currentProfileId: string | null, patientData: PatientDetails) => {
  if (!patientData?.assigned_practice || !patientData?.is_practice_assigned)
    return patientAssignedTypeConstants.UNASSIGNED
  if (patientData?.assigned_practice?.practice_profile_id === safeParseInt(currentProfileId))
    return patientAssignedTypeConstants.ASSIGNED_TO_ME
  return patientAssignedTypeConstants.ASSIGNED_TO_PRACTICE
}
