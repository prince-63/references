import searchResultTypes from '@constants/searchResultTypes'
import PATIENT_TYPE from '@constants/patientType.constants'

export type PatientType = (typeof PATIENT_TYPE)[keyof typeof PATIENT_TYPE]

export interface IPatient {
  id: number
  first_name: string
  last_name: string | null
  country_code: string
  email: string | null
  mobile: string | null
  profile_picture_url?: string | null
  profile_image_id?: number | null
  patient_mapped_id?: number
  patient_type?: PatientType
  has_read_existing_patient_form: boolean
  is_practice_assigned: boolean
}

export interface IPatientDetails {
  type: keyof typeof searchResultTypes
  patient: IPatient
}

export interface IPracticeLocationDetails {
  type: keyof typeof searchResultTypes
  practice_location_details: {
    practice_location_name: string
    city: string
  }
}
