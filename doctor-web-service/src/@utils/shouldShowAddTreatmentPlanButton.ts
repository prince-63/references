import orderStatusConstants from '@constants/orderStatus.constants'
import {GettingStartedDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import hasValue from 'utils/hasValue'

interface ShouldShowAddTreatmentPlanButtonParams {
  isStarterPlanUser: boolean
  isOrganization: boolean
  patientAssignedTo: string
  canCreateTreatmentPlan: boolean
  orderId?: string | null
  gettingStartedDataLeadsOverview: GettingStartedDetails
  isLastOrderCompleted: boolean
}

const shouldShowAddTreatmentPlanButton = ({
  isStarterPlanUser,
  isOrganization,
  patientAssignedTo,
  canCreateTreatmentPlan,
  orderId,
  gettingStartedDataLeadsOverview,
  isLastOrderCompleted,
}: ShouldShowAddTreatmentPlanButtonParams): boolean => {
  if (isStarterPlanUser) {
    return true
  }
  if (isOrganization && patientAssignedTo === 'ASSIGNED_TO_ME') {
    return true
  }
  if (isLastOrderCompleted) {
    return false
  }

  if (
    canCreateTreatmentPlan &&
    patientAssignedTo === 'ASSIGNED_TO_PRACTICE' &&
    hasValue(orderId) &&
    (gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.ORDERED ||
      gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.RE_PLAN ||
      gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.IN_PROGRESS)
  ) {
    return true
  }

  return false
}

export default shouldShowAddTreatmentPlanButton
