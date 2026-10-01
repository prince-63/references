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
}

export default ACTIVITY_TITLE_MAP
