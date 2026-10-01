import newOrderStatusConstants from '@constants/newOrderStatus.constants'

export type OrderStatus = keyof typeof newOrderStatusConstants

export type CaseType = 'INITIAL' | 'REFINEMENT'

export interface PatientListRequestV3 {
  organization_id?: number | null
  profile_id?: number | null
  practice_location_id?: number | null
  customer_mapped_id?: string | null
  search?: string | null
  patient_type?: string | null
  product_id?: number | null
  clinic_id?: number | null
  case_type?: CaseType | null
  order_status?: OrderStatus | null
  page_number: number
  page_size: number
  sort_by?: string | null
  sort_direction?: 'ASC' | 'DESC' | null
  last_updated_from?: string | null
  last_updated_to?: string | null
  doctor_id?: number | null
  archive?: boolean | null
}

export interface PatientSummaryDTO {
  patient_id: number
  full_name: string
  initials: string
  profile_picture_url: string | null
  email: string | null
  mobile_no: string | null
  customer_mapped_id: string | null
  practice_location_name: string | null
  practice_location_id: number | null
  product_name: string | null
  case_type: string | null
  order_status: OrderStatus | null
  vsp_order_status: OrderStatus | null
  next_action: string | null
  current_step: number | null
  last_updated: string | null
  invitation_status: string | null
  is_invitation_sent: boolean | null
  archived_on?: string | null
}

export interface PaginationDetails {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface PatientListResponseV3 {
  patients: PatientSummaryDTO[]
  pagination: PaginationDetails
}
