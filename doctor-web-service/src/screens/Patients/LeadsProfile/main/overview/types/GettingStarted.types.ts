import manufacturingConstants from '@constants/manufacturing.constants'
import orderStatusConstants from '@constants/orderStatus.constants'
export type TreatmentPlanStatus =
  | 'AWAITING_APPROVAL'
  | 'AWAITING_TREATMENT_PLAN'
  | 'APPROVED'
  | 'SENT_TO_PATIENT'
  | 'ACTIVE'
  | 'APPROVED_BY_PATIENT'
  | 'FINALIZED'
  | 'DEACTIVATED'
export type ManufacturingStatus =
  | 'MANUFACTURING'
  | 'PENDING'
  | 'MANUFACTURING_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | null
type CurrentStep =
  | 'ASSESSMENT'
  | 'IN_PROGRESS'
  | 'IN_MANUFACTURING'
  | 'IN_TRANSIT'
  | 'STARTING_SOON'
export type DeliveryPreference = 'IN_BATCHES' | 'ALL_ALIGNERS'

interface ShippingDetails {
  addressed_to: string
  name: string
  address_line: string
  city: string
  state: string
  country: string
  pincode: string
  is_default: boolean
}

interface ManufacturingDetails {
  status: ManufacturingStatus
  started_on: string
  id: number
  completed_on: string
  shipped_on: string
  total_aligners: number
  upper_aligner_start: number
  upper_aligner_end: number
  lower_aligner_start: number
  lower_aligner_end: number
  delivered_on: string
}

interface DeliveredAlignerDetails {
  count: number
  upper_range_start: number
  lower_range_start: number
  upper_range_end: number
  lower_range_end: number
}

interface Assessment {
  deactivated_at: string
  deactivation_reason: string | null
  deactivation_remark: string | null
  treatment_plan_status: TreatmentPlanStatus
  case_records_id: number | null
  pre_treatment_photos: boolean
  scan_files: boolean
  xrays_opg: boolean
  pre_treatment_photos_count: number | null
  scan_files_count: number | null
  xrays_opg_count: number | null
  purchase_order_status: keyof typeof orderStatusConstants
  purchase_order_id: string | null
  purchase_order_treatment_plan_count: number
  cancelled_on: string
}

interface ActiveTreatmentPlan {
  treatment_plan_id: number
  treatment_plan_name: string
  treatment_plan_tag_name: string
  treatment_planning_link: string
  created_at: string
  total_aligners: number
  start_upper_jaw: number
  end_upper_jaw: number
  start_lower_jaw: number
  end_lower_jaw: number
  brand_name: string
  recommended_hours_to_wear_aligners: number
  status: string
  days_to_wear_each_aligner: number
  treatment_plan_videos: any[]
  pdf_files: any[]
  other_files: any[]
  files: any[]
  treatment_plan_finalized_at: string | null
  remarks: string
}

interface InPlanning {
  active_treatment_plan: ActiveTreatmentPlan
  case_submitted_at: string
  treatment_plan_status: TreatmentPlanStatus
  cancelled_on: string
  purchase_order_status: string
  purchase_order_id: string
  purchase_order_treatment_plan_count: number
}
export interface IActiveTreatmentData {
  treatment_plan_id: number
  upper_jaw_total: string
  lower_jaw_total: string
  total_aligners: string
  start_upper_jaw: number
  end_upper_jaw: number
  start_lower_jaw: number
  end_lower_jaw: number
}
interface InManufacturing {
  delivery_preference: DeliveryPreference
  manufacturing_details_list: ManufacturingDetails[]
  active_treatment_plan: IActiveTreatmentData
  shipping_details: ShippingDetails
  case_submitted_at: string
  delivered_aligner_details: DeliveredAlignerDetails
  unprocessed_aligner_details: UnprocessedAlignerDetails
}

interface UnprocessedAlignerDetails {
  count: number
  upper_range_start: number
  lower_range_start: number
  upper_range_end: number
  lower_range_end: number
}

interface InTransit {
  manufacturing_id: number
  manufacturing_status: ManufacturingStatus
  shipping_details: {
    tracking_link: string
    tracking_number: string
    shipping_date: string
    tentative_date: string
    documents: any[]
    delivered_on: string
  }
  case_submitted_at: string
  delivery_date: string
}

interface StartingSoon {
  case_submitted_at: string
  reminder_date: string | null
  is_treatment_started: boolean
  treatment_plan_id: number | null
  reminder_id: number | null
}

export interface IGettingStartedSteps {
  current_step: CurrentStep
  order_id: number
  order_status: string
  assessment: Assessment
  in_planning: InPlanning
  in_manufacturing: InManufacturing
  in_transit: InTransit
  starting_soon: StartingSoon
  invited_patient: boolean
  treatment_plan_id: string
  cancelled_on: string
  latest_order_treatment_plan_status: TreatmentPlanStatus
}

export interface IManufacturing {
  status: keyof typeof manufacturingConstants
  shipping_date: string
  tentative_delivery_date: string
  delivery_date: string
  tracking_number: string
  tracking_link: string
  is_current: boolean
  notes: string
  documents: string[]
}

export interface IUnprocessedItem {
  reminder_id: number | null
  reminder_date: string | null
  due_by: string | null
  total_aligners: number | null
  upper_aligner_start: number | null
  upper_aligner_end: number | null
  lower_aligner_start: number | null
  lower_aligner_end: number | null
  due_days: number | null
}
export interface IManufacturingList {
  processed_manufacturing: ManufacturingItem[]
  unprocessed_manufacturing: IUnprocessedItem
}
export interface ManufacturingCounts {
  total_aligners_counts: number
  in_manufacturing_count: number
  unprocessed_counts: number
  delivered_counts: number
}
export interface ManufacturingItem {
  service_products: any
  completed_on: string | null
  status: ManufacturingStatus
  shipped_on: string
  shipping_added_on: string
  tentative_delivery_date: string
  delivery_date: string
  tracking_number: string
  tracking_link: string
  is_current: boolean
  documents: manufacturingDocument[] | null
  manufacturing_batch_id: number
  total_aligners: number
  upper_aligner_start: number
  upper_aligner_end: number
  lower_aligner_start: number
  lower_aligner_end: number
  due_days: number
  started_on: string | null
  delivered_on: string | null
  current_manufacturing_counts: ManufacturingCounts
  is_already_delivered: boolean
  is_show_mark_as_received: boolean
  created_by: string | null
  assignee: string | null
}

export interface BatchRecord {
  id: number
  batch_type: DeliveryPreference // 'IN_BATCHES' | 'ALL_ALIGNERS'
  status: ManufacturingStatus // 'MANUFACTURING' | 'PENDING' | ... | null
  total_aligners: number

  upper_aligner_start: number
  upper_aligner_end: number
  lower_aligner_start: number
  lower_aligner_end: number

  started_on: string | null
  completed_on: string | null
  shipped_on: string | null
  delivered_on: string | null
  due_date: string | null

  tracking_number: string | null
  tracking_link: string | null

  notes: string | null
}

interface manufacturingDocument {
  file_id: 0
  name: string
  url: string
  full_path: string
  created_by: 0
  created_by_user_type: string
  deleted_by: 0
  deleted_by_user_type: string
  folder: boolean
  type: string
  extension: string
  child_file_count: 0
  child_folder_count: 0
  children_files: [string]
  size: 0
  created_at: string | null
  default_folder: boolean
  patient_folder: boolean
  files_from_treatment_plan: boolean
  file_display_to_patient: boolean
}
