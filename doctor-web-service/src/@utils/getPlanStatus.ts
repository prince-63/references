import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

export const getPlanStatus = ({
  treatmentPlan,
  isNew,
  isReceivedPlan,
  isDraft,
}: {
  treatmentPlan: any
  isNew?: boolean
  isReceivedPlan?: boolean
  isDraft?: boolean
}) => {
  const treatmentPlanStatus = treatmentPlan.status || treatmentPlan?.treatment_status
  const approverStatus = treatmentPlan.approver_status as keyof typeof treatmentPlanStatusConstants
  const initiatorStatus =
    treatmentPlan.initiator_status as keyof typeof treatmentPlanStatusConstants
  const {isOrganization, isPractice, isCustomer} = useAllUserPlan()

  if (isNew || isDraft) {
    return 'DRAFT'
  }

  if (isOrganization && isReceivedPlan) {
    return treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT
      ? approverStatus === 'IN_PROGRESS'
        ? 'DRAFT'
        : approverStatus
      : treatmentPlanStatus
  }
  if (!isPractice && !isCustomer) {
    return treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT
      ? initiatorStatus === 'IN_PROGRESS'
        ? 'DRAFT'
        : initiatorStatus
      : treatmentPlanStatus
  }
  if (isPractice || isCustomer) {
    return treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT
      ? approverStatus === 'IN_PROGRESS'
        ? 'DRAFT'
        : approverStatus
      : treatmentPlanStatus
  }

  return treatmentPlanStatus
}
