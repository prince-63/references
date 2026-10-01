import invitationStatusTypes from '@constants/invitationStatusTypes'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'
import trackingTypes from '@constants/trackingTypes'
import userTypes from '@constants/userTypes'

export type TrackingType = keyof typeof trackingTypes
export type InvitationStatusType = keyof typeof invitationStatusTypes
export type trackingStatusType = keyof typeof trackingMethodTagTypes
export type userType = keyof typeof userTypes

export type TrackingDetailsType = {
  treatment_plan_id: number
  tracking_type: TrackingType
  current_aligner_details: {
    number: string
    start_date: string
    end_date: string
  }
  user_type: userType
  ask_patient_to_fill: boolean
  send_to_patient: boolean
  is_invitation_sent: InvitationStatusType
  pricing: string
  status: trackingStatusType
  aligner_treatment_plan_id: number
  doctor_name: string
  patient_data_fill_status: string
}

export type TrackingAddingPayload = {
  tracking_type: TrackingType
  current_aligner_details: {
    number: string
    start_date: string
    end_date: string
  }
  user_type: string
  pricing: number
  status: string
  aligner_treatment_plan_id: number
  doctor_name: string
  ask_to_patient_fill: boolean
  treatment_updating: boolean
  is_treatment_refinement?: boolean
}
