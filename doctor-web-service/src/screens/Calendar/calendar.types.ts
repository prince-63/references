import calendarEventsConstants from '@constants/calendarEvents.constants'
import {EventApi, EventInput} from '@fullcalendar/core'
import {EventContentArg} from '@fullcalendar/core'
import PATIENT_TYPE from '@constants/patientType.constants'
type patientType = (typeof PATIENT_TYPE)[keyof typeof PATIENT_TYPE]

export interface IPracticeLocation {
  practice_location_id: number
  practice_location_name: string
}
export interface IPatient {
  patient_id: number
  patient_name: string
  is_tracking_added: boolean
  amount_due: number | null
  practice_location_id: number | null
  treatment_cost_added: boolean
  has_ongoing_orders: boolean
  patient_type: patientType
  has_any_order: boolean
}
export interface IPatientList {
  value: string | number
  label: string
  is_tracking_added: boolean | null
  treatment_cost_added: boolean
  amount_due: number | null
  has_ongoing_orders: boolean
  patient_type: patientType
  has_any_order: boolean
}

export interface IContent {
  details: {
    title?: string
    is_braces_notes_added?: boolean
    reminder_id?: number
    paused_at?: string
    reason_for_pausing?: string
    patient_name?: string
    aligner_journey_id?: number
    braces_journey_id?: number
    aligner_action_id?: number
    appointment_id?: number
    patient_id?: number
    profile_url?: string
    previous_aligner_jaw_type?: string
    current_aligner_jaw_type?: string
    previous_aligner_number?: number
    current_aligner_number?: number
    days_delay_offset?: number
    start_date?: string
    end_date?: string
    date?: string
    time?: string
    check_in_performed?: boolean
    manual?: boolean
    practice_location_city?: string
    practice_location_name?: string
    amount?: string
    practice_location_id?: number
    feedback_needs_review?: boolean
    photos_uploaded?: boolean
    jaw_type?: string
    check_in_for_aligner_no?: number
    recommended_date_of_change?: string
    notes?: string
  }
}
export interface CustomExtendedProps {
  header: {
    date: string
    calendar_response_type: keyof typeof calendarEventsConstants
  }
  content: IContent
  calendar_response_type: keyof typeof calendarEventsConstants
}
export interface CustomEventInput extends EventInput {
  header: {
    date: string
    calendar_response_type: keyof typeof calendarEventsConstants
  }
  content: IContent
  calendar_response_type: keyof typeof calendarEventsConstants
}

export interface CustomEventContentArg extends EventContentArg {
  event: EventContentArg['event'] & {
    extendedProps: CustomExtendedProps
  }
}

export interface CustomEventApi extends EventApi {
  extendedProps: CustomExtendedProps
}
