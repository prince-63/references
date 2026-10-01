export interface APIPostData {
  chief_complaint: string
  patient_id: number
  pre_treatment_file_ids?: number[]
  profile_id: number
  scan_file_ids: number[]
  xray_file_ids: number[]
  doctor_id: number
  case_record_id: number | null
}

export interface APIGetDATA {
  patient_id: number
  // orderId may be provided as a string or explicitly null; the thunk will
  // include the query parameter if the field exists on the object.
  orderId?: string | null
}

export interface CaseRecordState {
  // Create Case Record
  loadingCreate: boolean
  errorCreate: string | null
  successCreate: boolean

  // Get Case Record (by POST or other existing method)
  loadingGet: boolean
  errorGet: string | null
  successGet: boolean
  caseRecordData: CaseRecordResponse | null

  // Get Single Case Record (by ID)
  loadingGetSingle: boolean
  errorGetSingle: string | null
  successGetSingle: boolean

  // Get All Case Records
  loadingGetAll: boolean
  errorGetAll: string | null
  successGetAll: boolean
  allCaseRecords: CaseRecordResponse[] | null

  // File Upload Tracking
  areAllFilesUploaded: boolean
  loadingDelete: boolean
  errorDelete: string | null
  successDelete: boolean
}

export interface CaseRecordFile {
  file_id: number
  name: string
  url: string
  full_path: string
  created_by: number
  created_by_user_type: string
  deleted_by: number | null
  deleted_by_user_type: string | null
  folder: boolean
  type: string
  extension: string
  child_file_count: number
  child_folder_count: number
  children_files: any[] // You can define a more specific type if needed
  size: number
  created_at: string
  default_folder: boolean
  patient_folder: boolean
  files_from_treatment_plan: boolean
  file_display_to_patient: boolean
  is_gdrive_platform?: boolean
  drive_file_id?: string
  thumbnail_url?: string
}

export interface CaseRecordResponse {
  case_record_id: number
  chief_complaint: string
  pre_treatment_files: CaseRecordFile[]
  scan_files: CaseRecordFile[]
  xray_files: CaseRecordFile[]
  created_at: string
  is_added_by_customer: boolean
  is_added_by_admin?: boolean
}
