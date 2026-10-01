import mappedTreatmentPlanStatusConstants from '@constants/mappedTreatmentPlanStatus.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'

interface GetTreatmentPlanStatusParams {
  treatmentPlan: AllTreatmentPlanListItem
  isPurchaseOrder?: boolean
}

const getMappedStatus = (
  status: keyof typeof treatmentPlanStatusConstants,
  defaultStatus: string
) => (status ? mappedTreatmentPlanStatusConstants[status] : defaultStatus)

const getTreatmentPlanStatus = ({treatmentPlan, isPurchaseOrder}: GetTreatmentPlanStatusParams) => {
  const treatmentPlanStatus = treatmentPlan.treatment_status
  const approverStatus = treatmentPlan.approver_status as keyof typeof treatmentPlanStatusConstants
  const initiatorStatus =
    treatmentPlan.initiator_status as keyof typeof treatmentPlanStatusConstants

  if (treatmentPlanStatus !== treatmentPlanStatusConstants.DRAFT) {
    return mappedTreatmentPlanStatusConstants[treatmentPlanStatus]
  }
  if (isPurchaseOrder) {
    return getMappedStatus(approverStatus, mappedTreatmentPlanStatusConstants[treatmentPlanStatus])
  } else {
    return getMappedStatus(initiatorStatus, mappedTreatmentPlanStatusConstants[treatmentPlanStatus])
  }

  // if (isOrganization || isDesignLabUser || isLabStaff) {
  //   return getMappedStatus(initiatorStatus, mappedTreatmentPlanStatusConstants[treatmentPlanStatus])
  // }

  // if (isPractice || isCustomer) {
  //   return getMappedStatus(approverStatus, mappedTreatmentPlanStatusConstants[treatmentPlanStatus])
  // }

  // return mappedTreatmentPlanStatusConstants[treatmentPlanStatus]
}

export default getTreatmentPlanStatus
