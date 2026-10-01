import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {getOverviewDataType} from 'screens/Patients/LeadsProfile/leadsProfile.types'
export default ({
  patientAssignedTo,
  dataLeadsData,
}: {
  patientAssignedTo: ReturnType<typeof getPatientAssignedTo>
  dataLeadsData: getOverviewDataType
}) => {
  if (patientAssignedTo === 'UNASSIGNED') {
    return true
  } else if (patientAssignedTo === 'ASSIGNED_TO_PRACTICE') {
    if (!dataLeadsData?.tracking?.enabled) {
      return true
    }
    if (!dataLeadsData?.treatment_added) {
      return true
    }
  }
  return false
}
