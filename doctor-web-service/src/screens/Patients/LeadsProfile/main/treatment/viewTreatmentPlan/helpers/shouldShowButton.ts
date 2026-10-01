import patientAssignedTypeConstants from '@constants/patientAssignedType.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

type UserType =
  | 'ORG'
  | 'CONNECTED_PRACTICE'
  | 'INDEPENDENT_ORTHO'
  | 'LAB_STAFF'
  | 'CUSTOMER'
  | 'LAB_ADMIN'
type PatientAssigned = keyof typeof patientAssignedTypeConstants
type Status = keyof typeof treatmentPlanStatusConstants

export type ButtonType =
  | 'FINALIZE'
  | 'SEND_TO_PATIENT'
  | 'SAVE_AS_DRAFT'
  | 'REQUEST_REPLAN'
  | 'DEACTIVATE'
  | 'ARCHIVE'
  | 'APPROVE'
  | 'SEND_FOR_APPROVAL'

export const shouldShowButton = ({
  status,
  userType,
  patientAssigned,
  buttonType,
}: {
  status?: Status
  userType: UserType
  patientAssigned: PatientAssigned
  buttonType: ButtonType
}): boolean => {
  const visibilityMatrix: Record<Status, Record<ButtonType, boolean>> = {
    DRAFT: {
      FINALIZE:
        (userType === 'INDEPENDENT_ORTHO' || userType === 'ORG') &&
        patientAssigned === 'ASSIGNED_TO_ME',
      SEND_TO_PATIENT:
        (userType === 'INDEPENDENT_ORTHO' || userType === 'ORG') &&
        patientAssigned === 'ASSIGNED_TO_ME',
      SAVE_AS_DRAFT: userType !== 'CONNECTED_PRACTICE',
      REQUEST_REPLAN: false,
      DEACTIVATE:
        (userType === 'INDEPENDENT_ORTHO' || userType === 'ORG') &&
        patientAssigned === 'ASSIGNED_TO_ME',
      ARCHIVE: patientAssigned === 'ASSIGNED_TO_PRACTICE',
      APPROVE: false,
      SEND_FOR_APPROVAL: patientAssigned === 'ASSIGNED_TO_PRACTICE',
    },
    IN_PROGRESS: {
      FINALIZE:
        (userType === 'INDEPENDENT_ORTHO' || userType === 'ORG') &&
        patientAssigned === 'ASSIGNED_TO_ME',
      SEND_TO_PATIENT:
        (userType === 'INDEPENDENT_ORTHO' || userType === 'ORG') &&
        patientAssigned === 'ASSIGNED_TO_ME',
      SAVE_AS_DRAFT: userType !== 'CONNECTED_PRACTICE' && patientAssigned === 'ASSIGNED_TO_ME',
      REQUEST_REPLAN: false,
      DEACTIVATE:
        (userType === 'INDEPENDENT_ORTHO' || userType === 'ORG') &&
        patientAssigned === 'ASSIGNED_TO_ME',
      ARCHIVE: patientAssigned === 'ASSIGNED_TO_PRACTICE',
      APPROVE: false,
      SEND_FOR_APPROVAL: patientAssigned === 'ASSIGNED_TO_PRACTICE',
    },
    ACTIVE: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: patientAssigned === 'ASSIGNED_TO_ME',
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    DEACTIVATED: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    PAUSED: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    COMPLETE: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    SENT_TO_PATIENT: {
      FINALIZE: true && !(userType === 'ORG' && patientAssigned === 'ASSIGNED_TO_PRACTICE'),
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: true && !(userType === 'ORG' && patientAssigned === 'ASSIGNED_TO_PRACTICE'),
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    SENT_FOR_APPROVAL: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: userType !== 'CONNECTED_PRACTICE',
      APPROVE: userType === 'CONNECTED_PRACTICE' || userType === 'CUSTOMER',
      SEND_FOR_APPROVAL: false,
    },
    PENDING_APPROVAL: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: userType === 'CONNECTED_PRACTICE' || userType === 'CUSTOMER',
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: userType === 'CONNECTED_PRACTICE' || userType === 'CUSTOMER',
      SEND_FOR_APPROVAL: false,
    },
    APPROVED: {
      FINALIZE: userType === 'CONNECTED_PRACTICE' && patientAssigned === 'ASSIGNED_TO_ME',
      SEND_TO_PATIENT: userType === 'CONNECTED_PRACTICE' && patientAssigned === 'ASSIGNED_TO_ME',
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    ARCHIVED: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    RE_PLAN: {
      FINALIZE: false,
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
    PATIENT_APPROVED: {
      FINALIZE: userType !== 'ORG' || (userType === 'ORG' && patientAssigned === 'ASSIGNED_TO_ME'),
      SEND_TO_PATIENT: false,
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE:
        userType !== 'ORG' || (userType === 'ORG' && patientAssigned === 'ASSIGNED_TO_ME'),
      ARCHIVE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
    },
  }

  if (!status) {
    return false
  }
  return visibilityMatrix[status][buttonType] ?? false
}
