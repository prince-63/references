import alignerUpdateTypeConstants from '@constants/alignerUpdateType.constants'
import jawType from '@constants/jawType'
import updateCategoryConstants from '@constants/updateCategory.constants'
import actionList from '@staticData/actionList'
import leadsProfileNavBarItems from '@staticData/leadsProfileNavBarItems'
import {TrackingType} from './main/treatment/Tracking/types/tracking.types'
import userTypes from '@constants/userTypes'
import alignerIssuesConstants from '@constants/alignerIssues.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import taskToDoStatusTypes from '@constants/taskToDoStatusTypes'
import productTypes from '@constants/productTypes'
import TreatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import orderStatusConstants from '@constants/orderStatus.constants'

export type LeadsProfileTabs = (typeof leadsProfileNavBarItems)[number]
export type LeadsProfileNavBar = Record<LeadsProfileTabs['value'], boolean>
export type activeAction = Record<(typeof actionList)[number]['value'], boolean>
export type LeadsProfileNavItem = LeadsProfileTabs['value']
export type ActionItem = (typeof actionList)[number]['value']

export type getOverviewDataType = {
  tracking: {
    status: string | null
    type: TrackingType
    tracking_id: string | null
    ask_patient_to_fill: boolean
    has_patient_sent_data: boolean
    patient_data_fill_status: string
    enabled: boolean
    start_date: string
  }
  reason_for_pause: string | null
  treatment_plan: {
    journey_id: number | null
    aligner_treatment_status: keyof typeof treatmentPlanStatusConstants | null
    enabled: boolean
    treatment_plan_id: number | null
    resume_date: string | null
    patient_tracking_status: string | null
    treatment_plan_completed_date: string | null
  }
  braces_journey_tracking_response: {
    status: string
    braces_journey_id: number
    is_treatment_started: boolean
    enabled: boolean
  }
  file_added: boolean
  invited: boolean
  treatment_added: boolean
  service_selected: boolean
  treatment_plan_filled: boolean
  patient_connected: boolean
  treatment_active: boolean
  treatment_plan_id: number | null
  product_type_names: string[]
  deactivated_at: string | null
  reason_for_deactivation: string | null
  deactivated_remarks: string | null
  paused_at: string | null
  tracking_added_for_latest_treatment_plan: boolean
  current_treatment_plan_status: keyof typeof TreatmentPlanStatusConstants | null
  previous_treatment_plan_status: keyof typeof TreatmentPlanStatusConstants | null
  getting_started_order_status: keyof typeof orderStatusConstants | null
  treatment_plan_status: keyof typeof treatmentPlanStatusConstants | null
  getting_started_order_id: string | null
  treatment_plan_completed_remarks: string
}

export interface PatientGettingStartedOverviewResponse {
  patient_details: PatientDetails
  getting_started: gettingStartedOverviewDataType
  invitation_details: InvitationDetails
}

interface PatientDetails {
  id: number // long
  first_name: string
  last_name: string
  profile_picture_url: string
  addresses: AddressDetails[]
  age: number // integer
  email: string
  mobile: string
  uuid: string
  status: PatientStatus
  doctor_id: number // long
  last_login_at: string // ZonedDateTime
  country_code: CountryCode
  practice_location: string
  chief_complaint: string
  product_type_names: ProductTypeName[]
  gender: string
  full_name: string
  language: string
  org_name: string
}

interface AddressDetails {
  // Define address details structure based on your application's schema
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface PatientGettingStartedOverviewResponse {
  patient_details: PatientDetails
  getting_started: gettingStartedOverviewDataType
  invitation_details: InvitationDetails
}

interface PatientDetails {
  id: number // long
  first_name: string
  last_name: string
  profile_picture_url: string
  addresses: AddressDetails[]
  age: number // integer
  email: string
  mobile: string
  uuid: string
  status: PatientStatus
  doctor_id: number // long
  last_login_at: string // ZonedDateTime
  country_code: CountryCode
  practice_location: string
  chief_complaint: string
  product_type_names: ProductTypeName[]
  gender: string
  full_name: string
  language: string
  org_name: string
}

interface AddressDetails {
  // Define address details structure based on your application's schema
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface InvitationDetails {
  invitation_id: number // int
  is_patient_connected: boolean
  is_patient_invited: boolean
}

export interface PatientGettingStartedOverviewResponse {
  patient_details: PatientDetails
  getting_started: gettingStartedOverviewDataType
  invitation_details: InvitationDetails
}

interface PatientDetails {
  id: number // long
  first_name: string
  last_name: string
  profile_picture_url: string
  addresses: AddressDetails[]
  age: number // integer
  email: string
  mobile: string
  uuid: string
  status: PatientStatus
  doctor_id: number // long
  last_login_at: string // ZonedDateTime
  country_code: CountryCode
  practice_location: string
  chief_complaint: string
  product_type_names: ProductTypeName[]
  gender: string
  full_name: string
  language: string
  org_name: string
}

interface AddressDetails {
  // Define address details structure based on your application's schema
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
type CountryCode = string
type ProductTypeName = string

interface InvitationDetails {
  invitation_id: number // int
  is_patient_connected: boolean
  is_patient_invited: boolean
}

export type gettingStartedOverviewDataType = {
  case_info_details_filled: boolean
  pre_treatment_photos_filled: boolean
  patient_details_edited: boolean
  mark_all_as_read: boolean
  patient_data_fill_status: 'ASK_PATIENT_TO_FILL' | 'COMPLETED' | 'IN_PROGRESS'
  ask_patient_to_fill: boolean
  treatment_status: keyof typeof treatmentPlanStatusConstants // Add other possible statuses if needed
  product_type: keyof typeof productTypes
  tracking_status: string
  aligner_journey_id: number
  braces_notes_attached: boolean
  treatment_plan_finalize_date: string
  sent_for_patient_approval_date: string
}

export interface IPausedTreatmentData {
  pause_date: string
  days_remaining_on_current_aligner: number
  no_of_days_treatment_was_paused_for: number
  resume_date?: string
  next_aligner: number
  next_aligner_jaw_type: string
  current_aligner: number
}

export type ResumeTreatmentFormValues = {
  resumeDate: string
  alignerChanged: boolean
  startDateOfAligner: string
  extendCurrentAlignerWearDays: number | string
  alignerChangedTo: string
  daysToExtendAligner: number | string
}

export interface IPausedTreatmentData {
  pause_date: string
  days_remaining_on_current_aligner: number
  no_of_days_treatment_was_paused_for: number
  resume_date?: string
  next_aligner: number
  next_aligner_jaw_type: string
  current_aligner_number: number
  current_aligner_jaw_type: keyof typeof jawType
}

export interface IActions {
  actions: IAction[]
}

export interface IAction {
  aligner_acton_id: number
  previous_aligner: AlignerItem
  new_aligner: AlignerItem
  type: keyof typeof alignerUpdateTypeConstants
  performed_at: string
  update_category: keyof typeof updateCategoryConstants
  update_category_reason: string
}

export interface AlignerItem {
  aligner_id: number
  aligner_sr_no: number
  jaw_type: keyof typeof jawType
}

export interface IAlignerUpdateDetails {
  move_to_previous_aligner_enable?: boolean
  aligner_action_id: number
  aligner: IAlignerData
  recommended_hours_to_wear_aligners: number
  photos?: IPhoto[]
  aligner_check_in_feedback?: IAlignerChangeFeedbacks
  comments?: IComment[]
  performed_by: number
  performed_by_user_type: string
  perform_at: string
  type: keyof typeof alignerUpdateTypeConstants
  validate_at: string
  validated: boolean
  validated_by: number
  validated_by_user_type: string
  previous_aligner_details: IAlignerData
  next_aligner_details?: IAlignerData
  prior_aligner_details?: IAlignerData
  category?: keyof typeof updateCategoryConstants
  aligner_issue?: {
    type: keyof typeof alignerUpdateTypeConstants
    issue: keyof typeof alignerIssuesConstants
    other_issues: string
  }
}
export interface IComment {
  aligner_feedback_id: number
  feedbacker_user_id: number
  feedbacker_user_type: keyof typeof userTypes
  created_at: string
  feedback_message: string
  reply_to_aligner_feedback: number
  sender_name: string
  sender_profile_image_url: string | null
}
export interface IAlignerData {
  sr_no: number
  start_date: string
  end_date: string
  change_date: string
  avg_time_in_secs: number
  jaw_type: keyof typeof jawType
  no_of_days_to_wear: number
  compliance: string
  change_offset: number
  photos: IAlignerPhoto[]
  daily_wear_time_details: IDailyWearTimeDetail[]
  aligner_production?: AlignerProduction
}

export interface IJawFeedback {
  fitting_feedback: AlignerFittingFeedback
  changing_feedback: AlignerChangingFeedback
}

export interface AlignerFittingFeedback {
  fittings: string[]
}

export interface AlignerChangingFeedback {
  aligner_changing_issues: string[]
}
export interface IAlignerPhoto {
  aligner_photo_id: number
  aligner_journey_id: number
  aligner_no: number
  image_url: string
  with_aligner: boolean
  image_name: string
  description: string
  uploader_user_type: string
  uploaded_by: number
  deleter_user_type: string
  deleted_by: number
  deleted: boolean
}

export interface IDailyWearTimeDetail {
  date: string
  total_wear_time_in_sec: number
  total_out_time_in_sec: number
  last_status_changed_at: string
}

export interface AlignerProduction {
  production_lab: ProductionLab
  status: string
  sub_status: string
  last_status_update: LastStatusUpdate
}

export interface ProductionLab {
  lab_id: number
  name: string
  logo_url: string
}

export interface LastStatusUpdate {
  sr_no: number
  old_aligner_production_lab: string
  new_aligner_production_lab: string
  old_production_sub_status: string
  new_production_sub_status: string
  old_production_status: string
  new_production_status: string
  logged_at: string
}

export interface IPhoto {
  aligner_photo_id: number
  aligner_journey_id: number
  aligner_no: number
  image_url: string
  with_aligner: boolean
  image_name: string
  description: string
  uploader_user_type: string
  uploaded_by: number
  deleter_user_type: string
  deleted_by: number
  deleted: boolean
  type: string
  jaw_type: keyof typeof jawType
}

export interface IActions {
  actions: IAction[]
}

export interface IAction {
  aligner_acton_id: number
  previous_aligner: AlignerItem
  new_aligner: AlignerItem
  type: keyof typeof alignerUpdateTypeConstants
  performed_at: string
  update_category: keyof typeof updateCategoryConstants
  update_category_reason: string
}

export interface AlignerItem {
  aligner_id: number
  aligner_sr_no: number
  jaw_type: keyof typeof jawType
}

export interface IAlignerUpdateDetails {
  aligner_action_id: number
  aligner: IAlignerData
  recommended_hours_to_wear_aligners: number
  photos?: IPhoto[]
  aligner_check_in_feedback?: IAlignerChangeFeedbacks
  comments?: IComment[]
  performed_by: number
  performed_by_user_type: string
  perform_at: string
  type: keyof typeof alignerUpdateTypeConstants
  validate_at: string
  validated: boolean
  validated_by: number
  validated_by_user_type: string
  previous_aligner_details: IAlignerData
  next_aligner_details?: IAlignerData
  aligner_issue?: {
    type: keyof typeof alignerUpdateTypeConstants
    issue: keyof typeof alignerIssuesConstants
    other_issues: string
  }
}
export interface IComment {
  aligner_feedback_id: number
  feedbacker_user_id: number
  feedbacker_user_type: keyof typeof userTypes
  created_at: string
  feedback_message: string
  reply_to_aligner_feedback: number
}
export interface IAlignerData {
  sr_no: number
  start_date: string
  end_date: string
  change_date: string
  avg_time_in_secs: number
  jaw_type: keyof typeof jawType
  no_of_days_to_wear: number
  aligner_compliance: string
  change_offset: number
  photos: IAlignerPhoto[]
  daily_wear_time_details: IDailyWearTimeDetail[]
  aligner_production?: AlignerProduction
}
export type IAlignerChangeFeedbacks = {
  aligner_feedback_id: number
  feedbacker_user_id: number
  feedbacker_user_type: string
  created_at: string
  other_issues: string
  feedbacks: Record<
    keyof Pick<typeof jawType, typeof jawType.LOWER | typeof jawType.UPPER>,
    IJawFeedback
  >
}

export interface AlignerFittingFeedback {
  fittings: string[]
}

export interface AlignerChangingFeedback {
  aligner_changing_issues: string[]
}
export interface IAlignerPhoto {
  aligner_photo_id: number
  aligner_journey_id: number
  aligner_no: number
  image_url: string
  with_aligner: boolean
  image_name: string
  description: string
  uploader_user_type: string
  uploaded_by: number
  deleter_user_type: string
  deleted_by: number
  deleted: boolean
}

export interface IDailyWearTimeDetail {
  date: string
  total_wear_time_in_sec: number
  total_out_time_in_sec: number
  last_status_changed_at: string
}

export interface AlignerProduction {
  production_lab: ProductionLab
  status: string
  sub_status: string
  last_status_update: LastStatusUpdate
}

export interface ProductionLab {
  lab_id: number
  name: string
  logo_url: string
}

export interface LastStatusUpdate {
  sr_no: number
  old_aligner_production_lab: string
  new_aligner_production_lab: string
  old_production_sub_status: string
  new_production_sub_status: string
  old_production_status: string
  new_production_status: string
  logged_at: string
}

export interface IPhoto {
  aligner_photo_id: number
  aligner_journey_id: number
  aligner_no: number
  image_url: string
  with_aligner: boolean
  image_name: string
  description: string
  uploader_user_type: string
  uploaded_by: number
  deleter_user_type: string
  deleted_by: number
  deleted: boolean
  type: string
  jaw_type: keyof typeof jawType
}

export interface PatientProfileOverviewActionsData {
  type: TrackingType
  status: keyof typeof treatmentPlanStatusConstants | 'COMPLETED'
  aligner_changed: keyof typeof taskToDoStatusTypes | undefined
  aligner_check_in_reported: keyof typeof taskToDoStatusTypes | undefined
  issue_reported: keyof typeof taskToDoStatusTypes | undefined
}

export const TimelineEventsType = {
  TREATMENT_PLAN_ADDED: 'TREATMENT_PLAN_ADDED',
  TREATMENT_STARTING: 'TREATMENT_STARTING',
  TREATMENT_PAUSED: 'TREATMENT_PAUSED',
  TREATMENT_RESUMED: 'TREATMENT_RESUMED',
  FORCE_ALIGNER_CHANGE: 'FORCE_ALIGNER_CHANGE',
  PRODUCT_TYPE_ADDED: 'PRODUCT_TYPE_ADDED',
  PATIENT_ADDED: 'PATIENT_ADDED',
  TIMELINE_NOTE_ADDED: 'TIMELINE_NOTE_ADDED',
  REFINEMENT_TREATMENT: 'REFINEMENT_TREATMENT',
  TREATMENT_DEACTIVATED: 'TREATMENT_DEACTIVATED',
  ALIGNER_CHANGE: 'ALIGNER_CHANGE',
} as const
export type TimelineEventTypeList = (typeof TimelineEventsType)[keyof typeof TimelineEventsType]
