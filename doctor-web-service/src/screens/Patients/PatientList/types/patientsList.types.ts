import orderStatusConstants from '@constants/orderStatus.constants'
import patientFilterNavBar from '@staticData/patientFilterNavBar'
import {ManufacturingStatus} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'

export type PatientsNavTabs = (typeof patientFilterNavBar)[number]['value']
export type PatientBelongsTo =
  | 'ORG_PATIENT'
  | 'ASSIGNED_TO_PRACTICE'
  | 'ORTHODONTIC_PATIENT'
  | 'OWN_PATIENT'
  | 'NOT_ASSIGNED'
export type PatientsNavListFilter = Record<PatientsNavTabs, boolean>
interface AssignedPractice {
  practice_name: string
  practice_doctor_id: number
  practice_profile_id: number
  practice_organization_id: number
  name: string
  order_count: number
  customer_name: string | null
}
export interface PatientRowDetails {
  email: string
  mobile: string
  full_name: string
  patient_id: number
  practice_location_name: string
  app_invite_status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  treatment_type: string
  treatment_stage:
    | 'IN_PLANNING'
    | 'ASSESSMENT'
    | 'ONGOING'
    | 'PAUSED'
    | 'REFINEMENT'
    | 'ADD_TRACKING'
    | 'STARTING_SOON'
    | 'MANUFACTURING'
    | 'IN_TRANSIT'
    | 'COMPLETE'
    | 'DEACTIVATED'
  added_on: string | null
  practice_location_id: number
  brand_name: string
  profile_url: string
  profile_image_id: number | null
  country_code: string
  patient_belongs_to: PatientBelongsTo
  aligner_journey_id: number
  is_your_patient: boolean
  doctor_id: number
  assigned_practice: AssignedPractice
  patient_type: 'NEW_PATIENT' | 'EXISTING_PATIENT' | string
  has_read_existing_patient_form: boolean
  resent_invite_at: string | null
  order_status: keyof typeof orderStatusConstants | null

  custom_patient_id: string | null
  order_count: number | null
  list_count: number | null
  treatments: string[]
  archived_on: string | null
  order_id: string | null
  manufacturing_status: ManufacturingStatus
  is_tracking_added: boolean
  age: string | null
  gender: string | null
  customer_mapped_id: string
  created_by: string
  profile_picture_id: number | null
}

export interface countData {
  all_patient: number
  in_planning: number
  in_assessment: number
  tracking_pending: number
  starting_soon: number
  ongoing: number
  completed: number
  paused: number
  in_refinement: number
}

export interface pagination_details {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  customer_patients: number
  practice_patient: number
}

export interface list_count {
  all_count: number
  lead_count: number
  active_count: number
}

interface PracticeLocation {
  practice_doctor_id: number
  practice_profile_id: number
  practice_organization_id: number
  name: string
}

interface PaginationDetails {
  page_number: number
  page_size: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface ArchivePatient {
  first_name: string
  last_name: string
  product_type_names: string[]
  product_types: string
  practice_location_name: string
  email: string
  mobile: string
  services: string
  invited_at: string // ISO date string
  patient_id: number
  profile_image: string
  chief_complaint: string
  archived_at: string // ISO date string
  country_code: string
  patient_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' // Assuming these are the possible statuses
  patient_name: string
  assigned_practice: PracticeLocation
  is_your_patient: boolean
  pagination_details: PaginationDetails
  uuid: string
  app_invite_status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  treatment_stage: 'IN_PLANNING' | 'ASSESSMENT' | 'ONGOING' | 'PAUSED' | 'REFINEMENT'
  treatment_type: string | null
  patient_belongs_to: 'ORG_PATIENT' | 'ASSIGNED_TO_PRACTICE' | 'ORTHODONTIC_PATIENT'
}
