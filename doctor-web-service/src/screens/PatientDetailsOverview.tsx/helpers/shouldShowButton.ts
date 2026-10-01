import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

type UserType = 'ORG' | 'CONNECTED_PRACTICE' | 'CUSTOMER' | 'LAB_ADMIN' | 'GROWTH_ORG'

type Status = keyof typeof treatmentPlanStatusConstants

export type ButtonType =
  | 'SAVE_AS_DRAFT'
  | 'REQUEST_REPLAN'
  | 'DEACTIVATE'
  | 'APPROVE'
  | 'SEND_FOR_APPROVAL'
  | 'DELETE_DRAFT'
  | 'EDIT_PLAN'

export const shouldShowButton = ({
  status,
  userType,
  buttonType,
}: {
  status?: Status
  userType: UserType
  buttonType: ButtonType
}): boolean => {
  const visibilityMatrix: Record<Status, Record<ButtonType, boolean>> = {
    DRAFT: {
      SAVE_AS_DRAFT: userType !== 'CONNECTED_PRACTICE',
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: userType !== 'CONNECTED_PRACTICE' && userType !== 'CUSTOMER',
      DELETE_DRAFT: true,
      EDIT_PLAN: true,
    },
    IN_PROGRESS: {
      SAVE_AS_DRAFT: userType !== 'CONNECTED_PRACTICE',
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: true,
      SEND_FOR_APPROVAL: userType !== 'CONNECTED_PRACTICE' && userType !== 'CUSTOMER',
      DELETE_DRAFT: true,
      EDIT_PLAN: true,
    },
    ACTIVE: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: true,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    DEACTIVATED: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    PAUSED: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    COMPLETE: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    SENT_FOR_APPROVAL: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: true,
      DEACTIVATE: false,
      APPROVE: true,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    PENDING_APPROVAL: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: userType === 'CONNECTED_PRACTICE' || userType === 'CUSTOMER',
      DEACTIVATE: false,
      APPROVE: userType === 'CONNECTED_PRACTICE' || userType === 'CUSTOMER',
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    APPROVED: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    ARCHIVED: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
    RE_PLAN: {
      SAVE_AS_DRAFT: false,
      REQUEST_REPLAN: false,
      DEACTIVATE: false,
      APPROVE: false,
      SEND_FOR_APPROVAL: false,
      DELETE_DRAFT: false,
      EDIT_PLAN: false,
    },
  }

  if (!status) {
    return false
  }
  // Defensive guard: if runtime provides a status not present in the matrix, default to false
  const row = (visibilityMatrix as any)[status]
  if (!row) return false
  return Boolean(row[buttonType])
}
