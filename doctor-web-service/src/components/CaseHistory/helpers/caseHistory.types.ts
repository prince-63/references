export type ActivityType =
  | 'CASE_CREATION'
  | 'RECORD_UPLOAD'
  | 'SUBMISSION'
  | 'INFORMATION_REQUEST'
  | 'INITIAL_PLAN'
  | 'REVISION_FEEDBACK'
  | 'ITERATIVE_PLAN'
  | 'APPROVAL'
  | 'PRIMARY_CLOSURE'
  | 'VSP_CASE_CREATED'
  | 'VSP_CASE_SUBMITTED'
  | 'VSP_FILES_UPLOADED'
  | 'VSP_PLAN_READY_FOR_REVIEW'
  | 'VSP_PLAN_APPROVED'
  | 'VSP_REVISION_REQUESTED'
  | 'VSP_MORE_INFORMATION_REQUIRED'
  | 'VSP_PLANNING_COMPLETED'
  | 'VSP_PRODUCTION_ORDER_CREATED'
  | 'VSP_ORDER_SHIPPED'
  | 'VSP_ORDER_DELIVERED'
  | 'REFINEMENT_START'
  | 'STL_REQUESTED'
  | 'STL_UPLOADED'
  | 'PLANNING_DONE'
  | 'SHIPPED'
  | 'DELIVERED'

export interface CaseActivityItem {
  id: number
  patient_id: number
  activity: string
  activity_type: ActivityType
  activity_by: string
  activity_at: string
  is_custom_activity: boolean
  timestamp: string
}

export interface ParsedActivity {
  description: string
  note: string | null
  noteLabel: string | null
}
