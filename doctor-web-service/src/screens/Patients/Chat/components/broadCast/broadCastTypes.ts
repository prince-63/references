export type FormValues = {
  customMessage: string
}
export type FilterOption = {
  value: string
  label: string
}

export interface RowDataForBroadcastListPatients {
  patient_id: number
  patient_name: string
  patient_mobile_number: number
  patient_email_id: string
  patient_profile_photo: string | null
  profile_image_id?: number | null
  aligner_brand_name: string
  current_aligner_number: number
  total_aligners: number
  avg_wear_time_in_sec: number
}
