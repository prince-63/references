import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'

export interface IPatient_details {
  first_name: string
  last_name: string | null
  profile_picture_url: string | null
  patient_code: string
  age: number | null
  email: string | null
  mobile: string | null
  country_code: string
  practice_location: string | null
  gender: string | null
  uuid: string | null
}

export interface IAlignerTrackingAligner {
  aligner_compliance: string
  change_offset: number | null
  jaw_type: string
  sr_no: number
  start_date: string
  end_date: string
  change_date: string | null
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

export interface IAppointmentDetails {
  product_type_name: string
  appointment_id: number
  amount: number
  current_appointment_date: string
  status: string
  jaws: Jaw[]
  files: IFile[]
  draft_files: IFile[]
  first_name: string
  last_name: string
  email: string
  country_code: string
  practice_location_name: string
}
