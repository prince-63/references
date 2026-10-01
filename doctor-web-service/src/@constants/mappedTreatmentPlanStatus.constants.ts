import orderStatusConstants from './orderStatus.constants'
import treatmentPlanStatusConstants from './treatmentPlanStatus.constants'

export default {
  [treatmentPlanStatusConstants.DRAFT]: 'Draft',
  [treatmentPlanStatusConstants.ACTIVE]: 'Active',
  [treatmentPlanStatusConstants.DEACTIVATED]: 'Deactivated',
  [treatmentPlanStatusConstants.PAUSED]: 'Paused',
  [treatmentPlanStatusConstants.SENT_TO_PATIENT]: 'Sent to patient',
  [treatmentPlanStatusConstants.SENT_FOR_APPROVAL]: 'Sent for approval',
  [treatmentPlanStatusConstants.PENDING_APPROVAL]: 'Pending approval',
  [treatmentPlanStatusConstants.APPROVED]: 'Approved',
  PATIENT_APPROVED: 'Patient approved',
  [treatmentPlanStatusConstants.ARCHIVED]: 'Archived',
  [treatmentPlanStatusConstants.RE_PLAN]: 'Re-plan',
  [orderStatusConstants.IN_PROGRESS]: 'Draft',
  [treatmentPlanStatusConstants.COMPLETE]: 'Completed',
} as const
