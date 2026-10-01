export type ColumnType = {
  id: number
  order: number
  name: string
  [key: string]: unknown
}

export interface Task {
  id: number
  patient_id: number
  workflow_id: number
  priority_id?: number
  assignees_ids?: number[]
  patient_name: string
  gender: string
  age: number
  created_by: string
  created_on: string
  product: string
  follow_up_date: string
  case_type: string
  assignee: string
  clinic: string
  current_workflow_status_id: number
  workflow_name?: string
  sequence_number?: string | number
  customer_mapped_id?: string | number
  labels?: Array<{key?: string; value?: string}>
  is_cloned_order: boolean
  org_id: number
  current_status_name: string
  previous_workflow_status_id: number | null
  created_for_profile_id: number | null
  created_for_profile_name: string | null
  order_type: string
  priority_level: string
  practice_name: string | null
  comments_count: number | null
  linked_plans: any | null
  linked_batch_details: any | null
  is_active: boolean
  is_archived: boolean
  completion_date: string | null
  estimated_completion_date: string | null
  workflow_position: number
  parent_task_id: number | null
  order_id: number | null
  manufacturing_batch_id: number
  task_type: string | null
  task_created_for: string | null
  service_products: string | any // Could be string or parsed object
  manufacturing_batch_response: ManufacturingBatchResponse
  ongoing_label_counts: {
    label_name: string
    name: string | null
    count: number
  }[]
  customer_name: string | null
  patient_created_by: string
  product_name: string
}
export interface ManufacturingBatchResponse {
  batch_number: number | null
  patient_id: number | null
  treatment_plan_id: number
  patient_full_name: string | null
  patient_profile_url: string | null
  case_type: string | null
  customer: string | null
  total_aligners: AlignerRange
  delivered: AlignerRange
  in_inventory: AlignerRange
  pending: AlignerRange
  transit: AlignerRange
  due_by: string | null
  reminder_date: string | null
  reminder_id: number | null
  order_id: number | null
  latest_batch_manufacturing_status: string
  due_by_status: string | null
  treatment_plan_status_completed: boolean
  treatment_plan_status: string | null
}

export interface AlignerRange {
  count: number
  upper_range_start: number
  lower_range_start: number
  upper_range_end: number
  lower_range_end: number
}
interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

interface PageAble {
  offset: number
  sort: Sort
  page_number: number
  page_size: number
  paged: boolean
  unpaged: boolean
}

export interface TaskResponse {
  total_elements: number
  total_pages: number
  size: number
  content: Task[]
  number: number
  sort: Sort
  number_of_elements: number
  pageable: PageAble
  first: boolean
  last: boolean
  empty: boolean
}
