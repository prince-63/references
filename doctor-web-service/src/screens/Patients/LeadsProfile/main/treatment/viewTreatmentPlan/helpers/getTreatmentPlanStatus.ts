import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {ITreatmentPlan} from '../../types/treatmentPlan.types'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'

export const getTreatmentPlanStatus = ({
  treatmentPlan,
  isNew,
  isReceivedPlan,
  isDraft,
}: {
  treatmentPlan: ITreatmentPlan
  isNew?: boolean
  isReceivedPlan?: boolean
  isDraft?: boolean
}) => {
  const treatmentPlanStatus = treatmentPlan.status
  const approverStatus = treatmentPlan.approver_status as keyof typeof treatmentPlanStatusConstants
  const initiatorStatus =
    treatmentPlan.initiator_status as keyof typeof treatmentPlanStatusConstants
  const {isOrganization, isPractice, isDesignLabUser, isCustomer, isVendor, isGrowthPlanUser} =
    useAllUserPlan()
  if (isNew || isDraft) {
    return 'DRAFT'
  }
  if (
    treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT &&
    hasValue(treatmentPlan.approved_by_patient_at)
  ) {
    return treatmentPlan.is_approved_by_patient ? 'PATIENT_APPROVED' : 'SENT_TO_PATIENT'
  } else {
    if (isOrganization && isReceivedPlan) {
      return treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT
        ? approverStatus
        : treatmentPlanStatus
    }
    if (isOrganization || isDesignLabUser || isVendor || isGrowthPlanUser) {
      return treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT
        ? initiatorStatus
        : treatmentPlanStatus
    }
    if (isPractice || isCustomer) {
      return treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT
        ? approverStatus
        : treatmentPlanStatus
    }
  }
  return treatmentPlanStatus
}
