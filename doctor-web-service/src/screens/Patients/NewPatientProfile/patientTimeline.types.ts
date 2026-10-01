import jawType from '@constants/jawType'
import {ALIGNER_ACTIONS} from '@constants/alignerActions.constants'
import uploadTreatmentPlanConstants from '@constants/uploadTreatmentPlan.constants'
import {PatientType} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

export interface IPatientTimeline {
  aligners: Aligner[]
  pending_actions_count: number
  patient_profile_overview_response: PatientProfileOverviewResponse
}

export interface PatientProfileOverviewResponse {
  current_aligner: number
  total_aligner: number
  over_due: number
  pending_actions_count: number
  treatment_planning_link: string
  upcoming_appointment: string | null
  treatment_plan_upload_type: keyof typeof uploadTreatmentPlanConstants | null
  order_id: string | null
  treatment_plan_id: number | null
  patient_type: PatientType
  treatment_plan_name: string
  treatment_plan_status: keyof typeof treatmentPlanStatusConstants
  treatment_plan_completed: boolean
  treatment_completion_date: string
}
export interface Aligner {
  aligner_id: number
  aligner_number: string
  total_aligner: number
  over_due: number
  start_date: string
  end_date: string
  aligner_change_approved: boolean
  patient_id: number
  change_date?: string
  time?: string
  current_aligner_number: string
  actions: Action[]
  jaw_type: keyof typeof jawType
  previous_aligner_number: number | null
  previous_jaw_type: keyof typeof jawType | null
  current_aligner_jaw_type: keyof typeof jawType
  aligner_journey_id: number
  aligner_changed: boolean
  pending_actions_count: number
  move_to_previous_aligner_enable: boolean
}

export interface Action {
  action_id: number | null
  action_type: keyof typeof ALIGNER_ACTIONS
  performed_at: string
  details: Details | null
}

export interface Details {
  approved: boolean
  aligner_journey_id: number
  approved_on?: string
  category?: string
  aligner_photos?: AlignerPhoto[]
  other_issues?: string
  jaw_type?: string
  issue?: string
  change_date?: string
  time?: string
  due_by?: number
  remark?: string
  reason_for_pause?: string
  remarks?: string
  reason?: string
  resumed_date?: string
  old_aligner_end_date?: string
  new_aligner_end_date?: string
  move_to_previous_aligner_enable?: boolean
  reason_for_move_to_previous_aligner?: string
}

export interface AlignerPhoto {
  image_url: string
  with_aligner: boolean
  aligner_photo_id: number
}
