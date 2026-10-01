import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import TreatmentPlanStatus from '@constants/treatmentPlanStatus.constants'
import {optionType} from 'types/optionType'
import {TrackingType} from '../Tracking/types/tracking.types'
import {RowDataForAppointmentsList} from '../../appointments/types/appointments.types'
import videoUploadTypesConstants from '@constants/videoUploadTypes.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import stlFileTypeConstants from '@constants/stlFileType.constants'
import stlFileUploadStatusConstants from '@constants/stlFileUploadStatus.constants'
import uploadTreatmentPlanConstants from '@constants/uploadTreatmentPlan.constants'
import {BatchRecord} from '../../overview/types/GettingStarted.types'

export interface TreatmentPlanPostData {
  details: {
    doctor_id: number
    patient_id: number
    order_id?: string | null
    initiator_status?: keyof typeof TreatmentPlanStatus | 'IN_PROGRESS'
    approver_status?: keyof typeof TreatmentPlanStatus
    order_status_changed_at?: string
    aligner_treatment_details?: {
      upper_jaw?: UpperJaw
      lower_jaw?: LowerJaw
    }
    treatment_sub_type?: string
    days_to_wear_each_aligner?: number
    recommended_hours_to_wear_aligners?: number
    treatment_planning_software?: string
    treatment_planning_link?: string
    treatment_plan_tag_name?: string | null
    remarks?: string
    tracking_status?: keyof typeof TreatmentPlanStatus
    status?: keyof typeof TreatmentPlanStatus
    linked_treatment_plan_id?: number
    current_aligner_no?: number
    start_date?: string
    end_date?: string
    treatment_plan_id?: number | null
    production_lab_details?: {
      production_lab_id: number
      brand_name: string
    }
    user_type?: string
    pricing?: number
    tracking_type?: TrackingType
    ask_to_patient_fill?: boolean
    video_display_to_patient?: boolean
    link_display_patient?: boolean
    approved_by_patient_at?: string | null
    is_approved_by_patient?: boolean
    treatment_plan_metadata?: ITreatmentPlanMetaData
    stl_file_metadata?: IStlFileMetadata
    treatment_plan_upload_type?: keyof typeof uploadTreatmentPlanConstants | null
    file_ids_to_clone?: number[]
  }
  video_files?: Record<VideoPositionKey, File>
  video_files_to_save?: Record<VideoPositionKey, File[]>
  files?: File[]
  other_files?: File[]
  pdf_file?: File
}
export interface ITreatmentPlanMetaData {
  replan_reason: string | null
  replan_requested_on?: string | null
}
export interface IDeactivateTreatmentPlanPostData {
  treatment_plan_id: number
  reason_for_deactivation: string
  other_remarks: string
}

export interface TreatmentPlanList {
  plan_name: string
  status: keyof typeof TreatmentPlanStatus
  total_number_of_aligners?: number
  planning_link?: string
  treatment_subtype: keyof typeof subTreatmentTypeConstants
  aligner_journey_id?: number
  braces_journey_id?: number
  treatment_plan_id: number
  latest_deactivated_date: string
}

export interface AllTreatmentPlanListItem {
  aligner_treatment_id: number
  braces_treatment_created_on: string | null
  braces_treatment_id: number | null
  total_aligner: number
  treatment_name: string
  created_by_me: boolean
  planning_link: string
  treatment_status: keyof typeof treatmentPlanStatusConstants // or other possible statuses
  treatment_type: 'ALIGNERS' | 'BRACES' | 'OTHER' // or other possible types
  order_id?: string
  created_at: string
  treatment_planning_link: string | null
  doctor_added_treatment_name: string
  treatment_plan_tag_name: string | null
  approved_by_patient_at: string | null
  approved_by_patient: boolean
  braces_notes_attached: boolean
  upper_jaw_details: UpperJaw
  lower_jaw_details: LowerJaw
  initiator_status?: keyof typeof TreatmentPlanStatus
  approver_status?: keyof typeof TreatmentPlanStatus
  treatment_plan_metadata?: ITreatmentPlanMetaData
  stl_file_metadata?: IStlFileMetadata
  linked_treatment_plan_metadata?: ILinkedTreatmentPlanMetaData
  purchase_order?: boolean
  customer_order?: boolean
  treatment_plan_completed_remarks?: string
}

export interface ILinkedTreatmentPlanMetaData {
  initiator_status: keyof typeof TreatmentPlanStatus
  approver_status: keyof typeof TreatmentPlanStatus
  linked_treatment_plan_id: number
}

export type VideoPositionKey = keyof typeof videoUploadTypesConstants
export interface IVideoFile {
  name: string
  url: string
  type: string
  extension: string
  thumbnail_url?: string
  is_gdrive_platform: boolean
}
export type FormValues = {
  treatment_sub_type: optionType | null
  treatment_plan_tag_name: string | null
  days_to_wear_each_aligner: optionType | null
  brand_name: optionType | null
  upperJaw: boolean
  lowerJaw: boolean
  recommended_hours_to_wear_aligners: optionType | null
  upperJawStartsWith: string
  upperJawEndsWith: string
  lowerJawStartsWith: string
  lowerJawEndsWith: string
  treatment_planning_link: string
  treatment_planning_software: optionType | null
  remarks: string
  files: File[]
  other_files: File[]
  pdf_file: File | null
  file_ids_to_clone: number[]
  video_files?:
    | File
    | null
    | Record<
        'SINGLE_VIDEO' | 'TOP' | 'BOTTOM' | 'FRONT' | 'LEFT' | 'RIGHT',
        {
          name: string
          url: string
          type: string
          extension: string
          is_gdrive_platform: boolean
        } | null
      >
  isAnyJawSelected: boolean
  video_type?: string
  link_display_patient: boolean
  video_display_to_patient: boolean
  treatment_plan_upload_type: keyof typeof uploadTreatmentPlanConstants
}

export interface ITreatmentPlan {
  patient_id: number
  created_at?: string
  order_id?: string
  linked_treatment_plan_id?: number
  initiator_status?: keyof typeof TreatmentPlanStatus
  approver_status?: keyof typeof TreatmentPlanStatus
  treatment_type: string
  treatment_plan_tag_name: string | null
  treatment_sub_type: string
  aligner_journey_id: number | null
  aligner_details_meta_data: AlignerDetailsMetaData
  treatment_planning_software?: string
  treatment_planning_link?: string
  remarks?: string
  days_to_wear_each_aligner: number
  recommended_hours_to_wear_aligners: number
  current_aligner_no: number
  status: keyof typeof TreatmentPlanStatus
  files: IFile[]
  other_files: IFile[]
  file_ids_to_clone?: number[]
  video_files?: Record<
    VideoPositionKey,
    {
      name: string
      url: string
      type: string
      extension: string
    } | null
  >
  doctor_id: number
  aligner_treatment_details: {
    upper_jaw?: UpperJaw
    lower_jaw?: LowerJaw
  }
  filesToSave?: File[]
  otherFilesToSave?: File[]
  video_files_to_save: Record<VideoPositionKey, File>
  treatment_plan_id: number
  treatment_plan_name: string
  total_aligners?: number
  production_lab_details: {
    production_lab_id: number
    brand_name: string
  }
  reason_for_deactivation?: string
  deactivated_at?: string
  updated_at?: string
  deactivatedRemarks?: string | null
  video_type: string
  video_display_to_patient: boolean
  is_link_display_patient: boolean
  link_display_patient: boolean
  treatment_plan_videos: {
    treatment_plan_video_tags: string
    video_url: string
    video_to_display_to_patient: boolean
  }[]
  is_approved_by_patient: boolean
  approved_by_patient_at: string | null
  order_status_changed_at?: string
  treatment_plan_metadata?: {
    replan_reason: string | null
  }
  stl_file_metadata?: IStlFileMetadata
  treatment_plan_upload_type?: keyof typeof uploadTreatmentPlanConstants | null
  pdf_files?: IFile[]
  pdf_file_to_save?: File
  linked_treatment_plan_metadata?: ILinkedTreatmentPlanMetaData
  is_purchase_order?: boolean
  is_customer_order?: boolean
  shipping_details_response?: {
    addressed_to: string
    name: string
    address_line: null | string
    city: string | null
    state: string | null
    country: string | null
    pincode: string | null
    shipping_id: null | number
    created_at: null | string
    default: boolean
  }
  manufacturing_details: BatchRecord[]
  upper_jaw_details: JawRangeTreatmentPlan
  lower_jaw_details: JawRangeTreatmentPlan
  pending_action_count: number
  stages: number
  version: string
}

export interface JawRangeTreatmentPlan {
  starts_with: number
  ends_with: number
  range: number[]
}

export interface IStlFileMetadata {
  printing_type: keyof typeof stlFileTypeConstants
  requested_at?: string | null
  link: string[]
  file_id: number[]
  status: keyof typeof stlFileUploadStatusConstants
  approved_on?: string | null
  uploaded_on?: string | null
}

export interface AlignerDetailsMetaData {
  upper_jaw: UpperJaw
  lower_jaw: LowerJaw
}
export interface UpperJaw {
  starts_with: number
  ends_with: number
  range: number[]
}

export interface LowerJaw {
  starts_with: number
  ends_with: number
  range: number[]
}
export interface IFile {
  name: string
  url: string
  full_path: string
  created_by: number
  created_by_user_type: string
  deleted_by: any
  deleted_by_user_type: any
  folder: boolean
  type: string
  extension: string
  child_file_count: number
  child_folder_count: number
  children_files: any[]
  size: number
  file_id: number
  created_at: string

  is_gdrive_platform: boolean
  thumbnail_url: string
}

export interface ITreatmentPlanBraces {
  braces_journey_id?: number
  doctor_id: number
  patient_id: number
  product_type_name: string
  tentative_treatment_duration_in_months: string
  bracket_type: string
  bracket_select_type: string
  bracket_select_sub_type: string
  bracket_sub_type: string
  bracket_brand: string
  input_bracket_brand: string
  teeth_extraction: string[]
  remarks: string
  treatment_stage?: string
  braces_treatment_stage: string
  treatment_name: string
  extraction_remarks: string
  lower_jaw_anchor_type_value: string
  upper_jaw_anchor_type_value: string
  treatment_start_date: string
  treatment_status?: string
}

export interface ITreatmentPlanBracesUpdate {
  braces_journey_id: number
  doctor_id: number
  patient_id: number
  product_type_name: string
  tentative_treatment_duration_in_months: string
  bracket_type: string
  bracket_select_type: string
  bracket_select_sub_type: string
  bracket_sub_type: string
  bracket_brand: string
  input_bracket_brand: string
  teeth_extraction: string[]
  remarks: string
  treatment_stage: string
  braces_treatment_stage: string
  treatment_name: string
  treatment_start_date: string
}

export interface ICompleteTreatmentPostData {
  treatment_plan_id: number
  treatment_completed_remarks: string
}

export interface IBracesTreatmentPlanDetails {
  doctor_id: number
  patient_id: number
  tentative_treatment_duration_in_months: number
  bracket_type: string
  bracket_select_type: string
  bracket_select_sub_type: string
  bracket_brand: string
  braces_treatment_stage: string
  teeth_extraction: string[]
  remarks: string
  next_appointment_date: string
  braces_journey_id: number
  previous_appointment_date: string
  email: string
  mobile: string
  first_name: string
  last_name: string
  uuid: string
  treatment_stage: string
  product_type_name: string
  cheif_complaint: string
  treatment_name: string
  treatment_created_at: string
  practice_location_name: string
  appointment_filled: boolean
  reminder_filled: boolean
  last_appointment_details: LastAppointmentDetails
  upcoming_appointment_reminder_details: RowDataForAppointmentsList
}

export interface LastAppointmentDetails {
  product_type_name: string
  appointment_id: number
  amount: number
  current_appointment_date: string
  next_appointment_date?: string
  status: string
  jaws: Jaw[]
  files: []
  start_date: string
  end_date: string
  draft_files: []
  first_name: string
  last_name: string
  mobile: string
  email?: string
  country_code: string
  practice_location_name: string
}

export interface Jaw {
  material_name: string
  material_size: string
  space_enclosure_tools: string[]
  accessories: string[]
  note: string
  shape: string
  treatment_stage_type: string
  jaw_type: string
}
