import filterAlignerPatientAnalyticsConstants from '@constants/filterAlignerPatientAnalyticsConstants'
import filterAlignerPatientAnalytics from '@staticData/filterAlignerPatientAnalytics'
import {PatientBelongsTo} from 'screens/Patients/PatientList/types/patientsList.types'

export type filterAlignerPatientAnalytics = (typeof filterAlignerPatientAnalytics)[number]['value']

export type practicesNavListFilter = Record<filterAlignerPatientAnalytics, boolean>

export type optionTypeAlignerPatientAnalytics = {
  value: keyof typeof filterAlignerPatientAnalyticsConstants
  label: string
}

export interface RequestList {
  doctor_id: number
  filter: keyof typeof filterAlignerPatientAnalyticsConstants | 'NEED_ATTENTION' | null
  page_number: number
  search: string | null
  is_aligner_pending_updates: boolean
  practice_location_ids: (string | number)[] | null
  practice_profile_ids: (string | number)[] | null
}

export interface ResponseList {
  patient_analytics_details: []
  pagination_details: {
    page_number: number
    page_size: number
    total_patients: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface RowData {
  patient_id: number
  aligner_journey_id: number
  patient_full_name: string
  patient_profile_url: string
  customer_mapped_id: number
  email: string | null
  country_code: string | null
  mobile: string | null
  practice_location: string | null
  aligner_updates: number | null
  current_aligner: number
  current_aligner_jaw_type: 'UPPER' | 'LOWER' | 'BOTH'
  total_aligners: number
  compliance: 'NEED_ATTENTION' | 'AT_RISK' | 'ON_TRACK'
  patient_belongs_to: PatientBelongsTo
  assigned_practice: string | null
  your_patient: boolean
  has_performed_any_action: boolean
  patient_app_invite_status: 'CONNECTED' | 'NOT_CONNECTED' | 'PENDING' | 'INVITED'
  patient_profile_image_id: number | null
}

export interface AllPatients {
  patient_id: number
  patient_full_name: string
  patient_profile_url: string
}

export interface CountsDataResponse {
  patient_compliance: {
    needs_attention: number
    at_risk: number
    on_track: number
    on_track_percentage: number
  }
  aligner_changes_till_date: {
    on_time: number
    delay_less_than7_days: number
    delay_more_than7_days: number
    on_time_percentage: number
  }
  aligner_check_in_till_date: {
    perfect_fit: number
    some_issue: number
    perfect_fit_percentage: number
  }
  issues_reported_till_date: {
    missing_aligner: number
    broken_aligner: number
    irritation_to_gums: number
    sharp_edges: number
    total_issue_reported_percentage: number
  }
}

export interface ResponseListAll {
  patient_id: number
  patient_full_name: string
  patient_profile_url: string
}
