import orderDueByFilterConstants from '@constants/orderDueByFilter.constants'
import orderStatusConstants from '@constants/orderStatus.constants'
import ordersPageFilterNavItems from '@staticData/ordersPageFilterNavItems'
import {PatientDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {Files} from 'screens/Patients/LeadsProfile/main/files/types/files.types'
import {
  IManufacturingList,
  IUnprocessedItem,
  ManufacturingItem,
  ManufacturingStatus,
} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'

export interface IOrder {
  doctor_id: number
  patient_details: PatientDetails
  order_details: IOrderDetails
  file_details: {
    images: Files[]
    scan_files: Files[]
    documents: Files[]
  }
  prescription_details: IPrescriptionDetails
  shipping_details: IShippingDetails
  treatment_plan_responses: AllTreatmentPlanListItem[]
  comment_details: IComment[]
  status: keyof typeof orderStatusConstants
  current_step: number
  order_id: string
  assigned_lab_user_id: number | null
  assigned_lab_user_name: string | null
  parent_file_id: number
  purchase_order_treatment_plan_ids_in_draft?: boolean
  purchase_order_treatment_plan_ids_count?: number
  is_purchase_order?: boolean
  is_new_order: boolean
  is_practice_order?: boolean
  is_customer_order?: boolean
  show_zip_file?: boolean
  purchase_order_details?: {
    order_id: string
    status: keyof typeof orderStatusConstants
    due_by: string
    is_urgent: boolean
  }
  order_owner_name: string
  manufacturing_status: string
  delivery_preference: string
  manufacturing_details: IManufacturingList
  unprocessed_aligner_details: IUnprocessedItem
  is_need_more_info_updated: boolean
  cancel_order_remark: string
  cancelled_on: string
  need_more_info_updated_on: string
  need_more_info_remark: string
  case_record_id: number | null
  prescription_id: number | null
  service_products: Product
  profile_id: number
  organization_id: number
  product_name: string
  product_image: string | null
  product_description: string | null
}
export type ModifiedOrderDetails = Omit<IOrderDetails, 'target_user_details'> & {
  target_user_details: Omit<IOrderDetails['target_user_details'], 'lab_name'>
}
export interface IOrderPostData {
  patient_details?: IOrderPatientDetails & {
    organization_id: number
    profile_id: number
  }
  order_details?: ModifiedOrderDetails
  prescription_details?: IPrescriptionDetails
  shipping_details?: IShippingDetails
  status: keyof typeof orderStatusConstants
  order_id?: string
  doctor_id: number
  patient_id?: number
  delivery_preference?: string
  is_practice_order?: boolean
  case_record_id?: number | null
  prescription_id?: number | null
  service_products?: any
  profile_id?: number
  practice_doctor_id?: number
  practice_profile_id?: number
  practice_organization_id?: number
  order_status?: keyof typeof orderStatusConstants
}
export interface IComment {
  order_id: number
  doctor_id: number
  profile_id: number
  notes: string
  profile_image_url: string
  display_name: string
  created_at: string
  remark: string | null
}

export interface IPrescriptionDetails {
  id?: number
  chief_complaint?: string
  treatment_needed?: string
  do_not_move_the_following_tooth?: string
  midline?: string
  attachments?: string
  inter_proximal_reduction?: string
  extraction?: string
  notes?: string
  midline_instructions?: string
  treatment_needed_for_tooth?: string[]
  do_not_move_the_following_selected_tooth?: string[]
  attachments_tooth_selected?: string[]
  extraction_tooth_selected?: string[]
  data?: any
  form_id?: string
}

export interface IOrderDetails {
  order_type: string
  due_by: string | null
  created_at?: string
  target_user_details: {
    doctor_id: string | number
    profile_id: string | number
    organization_id: string | number
    lab_name: string
  }
  delivery_preference?: string
  lab_id: number | string | null
}

export interface IShippingDetails {
  shipping_id?: number | string
  addressed_to: string
  name: string
  mobile_number?: string
  address_line: string | null
  city: string
  state: string
  country: string
  pincode: string
  default: boolean
  profile_id: number | null
  customer_profile_id: number | null
}

export interface FilterDrawerFormikContextType {
  search?: string | null
  filter_by?: string | null
  sort_by?: string | null
}

export interface RowOrderDetails {
  order_id: string
  doctor_id: number
  doctor_profile_id: number
  doctor_name: string
  patient_id: number
  patient_name: string
  order_creation_date: string // ISO date string
  order_type: 'PLANNING_ORDER' | 'SCANNING_ORDER'
  order_status: keyof typeof orderStatusConstants
  order_due_by: string // ISO date string
  is_urgent: boolean
  assigned_lab_user_id: number | null
  assigned_lab_user_name: string | null
  lab_display_name: string
  lab_user_profile_id: number
  linked_order_id: string | null
  latest_manufacturing_response: ManufacturingItem
  unprocessed_aligner_details: {count: number | null}
  is_practice_order: boolean
}
export interface AlignerRange {
  count: number
  upper_range_start: number
  lower_range_start: number
  upper_range_end: number
  lower_range_end: number
}

export interface IRowUnprocessedOrdersDetails {
  patient_id: number
  order_id: string
  treatment_plan_id: number
  patient_full_name: string
  patient_profile_url: string
  case_type: 'ARCHIVED' | string
  customer: string
  total_aligners: AlignerRange
  delivered: AlignerRange
  in_inventory: AlignerRange
  pending: AlignerRange
  transit: AlignerRange
  due_by: string // ISO date string e.g., "2025-06-24"
  reminder_date: string // ISO date string
  reminder_id: number
  latest_batch_manufacturing_status: ManufacturingStatus
  due_by_status: keyof typeof orderDueByFilterConstants
}

export interface IOrderPatientDetails {
  first_name: string
  last_name: string
  email: string | null
  mobile: string | null
  country_code: string
  practice_location: string | null
  inviter_id: number
  inviter_user_type: string
  customer_mapped_id: string
  age: number
  gender: string
  practice_location_id: number | null
  country: string
  state: string
  city: string
  practice_profile_id: number | null
  id?: number

  receiver_doctor_id: number
  receiver_org_id: number
  receiver_profile_id: number
  receiver_name?: string
}

export interface PaginationOrders {
  page_number: number // The current page number
  page_size: number // Number of items per page
  total_orders: number // Total number of patients
  total_pages: number // Total number of pages
  has_next: boolean // Whether there is a next page
  has_previous: boolean // Whether there is a previous page
  received: number // Number of patients received
  sent: number // Number of patients sent
  received_by_customer: 0
  received_by_practice: 30
  total_patients: 0
}

export type ordersPageFilterBar = Record<orderPageTabItems['value'], boolean>
export type orderPageTabItems = (typeof ordersPageFilterNavItems)[number]
export type orderNavigationItem = orderPageTabItems['value']
