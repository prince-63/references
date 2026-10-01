export type ActivityType =
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
