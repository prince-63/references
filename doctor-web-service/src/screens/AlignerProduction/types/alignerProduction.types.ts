export type ManufacturingBatchResponse = {
  patient_id: number
  treatment_plan_id: number
  patient_full_name: string
  patient_profile_url: string
  case_type: 'ARCHIVED' | string
  customer: string
  total_aligners: {count: number} & Record<string, number>
  delivered: {count: number} & Record<string, number>
  in_inventory: {count: number} & Record<string, number>
  pending: {count: number} & Record<string, number>
  transit: {count: number} & Record<string, number>
  due_by: string // YYYY-MM-DD
  reminder_date: string // YYYY-MM-DD
  reminder_id: number
  order_id: string
  latest_batch_manufacturing_status: string
  due_by_status: string
  treatment_plan_status_completed: boolean
  treatment_plan_status: string
}

export type ManufacturingSubTaskResponse = {
  treatment_plan_id: number
  batch_number: number
  category: 'ALIGNER' | string
  jaw_type: 'UPPER' | 'LOWER' | string
  aligner_number: number
  manufacturing_id: number
  treatment_version: string
}

export type Task = {
  id: number
  patient_id: number
  patient_name: string
  org_id: number
  workflow_id: number
  workflow_name: string
  current_workflow_status_id: number
  current_status_name: string
  previous_workflow_status_id: number
  gender: string
  age: number
  created_by: string
  created_on: string // ISO
  product: string
  follow_up_date: string // ISO
  case_type: boolean
  assignee: string
  clinic: string
  created_for_profile_id: number
  created_for_profile_name: string
  order_type: string
  priority_level: string
  practice_name: string
  comments_count: number
  labels: string[]
  linked_plans: string
  linked_batch_details: string
  is_active: boolean
  is_archived: boolean
  completion_date: string
  estimated_completion_date: string
  sequence_number: number
  workflow_position: number
  parent_task_id: number
  order_id: string
  manufacturing_batch_id: number
  task_type: string
  task_created_for: string
  service_products: any
  manufacturing_batch_response: ManufacturingBatchResponse
  manufacturing_sub_task_response: ManufacturingSubTaskResponse
  product_name: string
}

export type PaginationDetails = {
  page_number: number // 1-based here for UI
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export type AlignerProductionResponse = {
  label_counts: countsData[]
  tasks: Task[]
  pagination_details: PaginationDetails
  flags: Flag[]
}

export type Flag = {
  content: string
  id: number
  location: string
  profile_id: number
  show: boolean
}
export type countsData = {
  label_name: string
  count: number
}

export type AlignerProductionPayload = {
  order_type: string
  doctor_id: number
  workflow_name: string
  assignee_ids: number[]
  product_ids: number[]
  page_number: number
  page_size: number
  filter_by_label_name: string | null
  search: string
  sort?: string
}

export type PayloadStatusChange = {
  task_info: {task_id: number; patient_id: number}[]
  doctor_id: number
  workflow_status_id: number
  workflow_id: number
}
