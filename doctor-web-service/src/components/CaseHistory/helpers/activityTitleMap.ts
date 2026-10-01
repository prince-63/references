import {ActivityType} from './caseHistory.types'

/**
 * Display-friendly titles mapped by activity type.
 */
const ACTIVITY_TITLE_MAP: Record<ActivityType, string> = {
  CASE_CREATION: 'Case Created',
  RECORD_UPLOAD: 'Records Added',
  SUBMISSION: 'Case Submitted',
  INFORMATION_REQUEST: 'Info Requested',
  INITIAL_PLAN: 'Planning Started',
  REVISION_FEEDBACK: 'Revision Requested',
  ITERATIVE_PLAN: 'Plan Published',
  APPROVAL: 'Plan Approved',
  PRIMARY_CLOSURE: 'Case Completed',
  REFINEMENT_START: 'Refinement Sent',
  STL_REQUESTED: 'STL Requested',
  STL_UPLOADED: 'STL Uploaded',
  PLANNING_DONE: 'Planning Done',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  VSP_CASE_CREATED: 'Case Created',
  VSP_CASE_SUBMITTED: 'Case Submitted',
  VSP_FILES_UPLOADED: 'Files Uploaded',
  VSP_PLAN_READY_FOR_REVIEW: 'Plan Ready for Review',
  VSP_PLAN_APPROVED: 'Plan Approved',
  VSP_REVISION_REQUESTED: 'Revision Requested',
  VSP_MORE_INFORMATION_REQUIRED: 'More Info Required',
  VSP_PLANNING_COMPLETED: 'Planning Completed',
  VSP_PRODUCTION_ORDER_CREATED: 'Production Order Created',
  VSP_ORDER_SHIPPED: 'Order Shipped',
  VSP_ORDER_DELIVERED: 'Order Delivered',
}

export default ACTIVITY_TITLE_MAP
