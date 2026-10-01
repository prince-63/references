import bracesReminderStatus from '@constants/bracesReminderStatus'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import TreatmentPlanStatus from '@constants/treatmentPlanStatus.constants'
import userTypes from '@constants/userTypes'
import appointmentsFilterNavItems from '@staticData/appointmentsFilterNavItems'

export interface TreatmentPlanList {
  plan_name: string
  status: keyof typeof TreatmentPlanStatus
  total_number_of_aligners?: number
  planning_link?: string
  treatment_subtype: keyof typeof subTreatmentTypeConstants
  aligner_journey_id?: number
  braces_journey_id?: number
  treatment_plan_id: number
}
export type appointmentNavTabs = (typeof appointmentsFilterNavItems)[number]
export type appointmentNavListItem = appointmentNavTabs['value']
export type outletContext = {
  filter: appointmentNavListFilter
  toggleAddAppointmentFormContainer: (value: boolean) => void
  setSelectedAppointmentDetails: React.Dispatch<
    React.SetStateAction<RowDataForAppointmentsList | undefined>
  >
  setIsDeleteModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}
export type appointmentNavListFilter = Record<appointmentNavTabs['value'], boolean>

export interface RowDataForAppointmentsList {
  appointment_id: number
  start_date: string
  end_date: string
  notes?: string
  amount?: string
  braces_journey_id?: number
  braces_notes_added: boolean
  braces_notes_id?: number
  practice_location_id: number
}

export interface AppointmentReminderListData {
  user_type: keyof typeof userTypes
  doctor_id: number
  date: string
  status: keyof typeof bracesReminderStatus
  practice_location_name: string
  first_name: string
  last_name: string
  patient_id: number
  mobile: string
  country_code: string
  email: string
  time?: string
  reminder_id?: number
}

export interface jawTypeDetail {
  jaw_type: string
  treatment_stage_type: string
  shape: string
  material_name: string
  material_size: string
  space_enclosure_tools: Array<string>
  accessories: Array<string>
  note: string
  input_material_name: string
  input_material_size: string
  input_space_enclosure_tools: string
  input_accessories: string
}

export interface AppointmentListData {
  product_type_name: string
  appointment_id: number
  amount: number
  current_appointment_date: string
  start_date: string
  end_date: string | null
  next_appointment_date: string
  status: string
  jaws: jawTypeDetail[]
  files: string[]
  draft_files: string[]
  first_name: string
  last_name: string
  mobile: string
  email: string
  country_code: string
  practice_location_name: string
}
export interface RowDataForBracesNotesList {
  start_date: string
  end_date: string | null
  jaw_type: string
  upperJaw: jawTypeDetail | null
  lowerJaw: jawTypeDetail | null
  appointment_id: number
  status: string
}

export interface AddAppointmentData {
  braces_journey_id: number
  amount: number
  status: string
  doctor_id: number
  patient_id: number
  start_date: string
  end_date?: string
  reminder_id: number
  product_type_name: string
  jaw_main_type: string
  both: jawTypeDetail
  upper: jawTypeDetail
  lower: jawTypeDetail
  local_files?: {url: string; type: string}[]
  new_files?: File[]
  files: File[]
  draft_files: File[]
}

interface jaw_details {
  jaw_type: string
  treatment_stage_type: string
  shape: string
  material_name: string
  material_size: string
  space_enclosure_tools: Array<string>
  accessories: Array<string>
  note: string
}

export interface AppointmentPostData {
  appointment_id?: number
  reminder_id?: number
  braces_journey_id: number
  amount: number
  status: string
  doctor_id: number
  patient_id: number
  start_date: string
  end_date?: string
  product_type_name: string
  jaw_details: jaw_details[]
  files?: File[]
  draft_files?: []
}
