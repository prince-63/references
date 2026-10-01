import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {AllTreatmentPlanListItem} from '../../types/treatmentPlan.types'
import mappedTreatmentPlanStatusConstants from '@constants/mappedTreatmentPlanStatus.constants'

interface GetTreatmentPlanStatusParams {
  treatmentPlan: AllTreatmentPlanListItem
  isPurchaseOrder?: boolean
}
const getMappedStatus = (
  status: keyof typeof treatmentPlanStatusConstants | undefined,
  defaultStatus: string
) => (status ? mappedTreatmentPlanStatusConstants[status] : defaultStatus)

export default ({treatmentPlan, isPurchaseOrder}: GetTreatmentPlanStatusParams) => {
  const approverStatus = treatmentPlan.linked_treatment_plan_metadata
    ?.approver_status as keyof typeof treatmentPlanStatusConstants
  const initiatorStatus = treatmentPlan.linked_treatment_plan_metadata
    ?.initiator_status as keyof typeof treatmentPlanStatusConstants

  const treatmentPlanStatus = treatmentPlan.treatment_status
  if (isPurchaseOrder) {
    return getMappedStatus(initiatorStatus, mappedTreatmentPlanStatusConstants[treatmentPlanStatus])
  } else {
    return getMappedStatus(approverStatus, mappedTreatmentPlanStatusConstants[treatmentPlanStatus])
  }
}
