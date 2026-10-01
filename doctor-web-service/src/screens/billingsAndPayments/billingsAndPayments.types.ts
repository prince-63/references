import filterByReminderForPaymentsConstants from '@constants/filterByReminderForPayments.constants'
import {optionType} from 'types/optionType'

export type FilterDrawerFormikContextType = {
  checked_treatment_list: string[]
  patient_search?: string | null
  checked_practice_location_list: optionType[]
  filter_by_reminder: keyof typeof filterByReminderForPaymentsConstants
  sort_by: {
    sort: string | null
    type: string | null
  }
  filter_by_payment_date: {
    from_date: string | null
    to_date: string | null
  }
}

export interface BillingAndPayments {
  doctor_id: string
  total_outstanding: number
  due_this_month: number
  received_this_month: number
  compare_to_last_month: null | number
  total_outstanding_by_filter?: number
  balance_received_by_filter?: number
  total_remaining_cost: number
  total_patients: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  patient_details: RowDataForBillingsAndPayments[]
}

export interface RowDataForBillingsAndPayments {
  patient_name: string
  patient_id: string
  patient_created_on: string
  treatments: string[] | null
  practice_location_name: string
  practice_location_id: number
  treatment_cost?: number
  balance_payment?: number
  last_payment_received?: LastPaymentReceived
  doctor_id: string
  profile_url: string | null
  profile_image_id: number | null
  payment_reminder_details?: PaymentReminder | null
  patient_status: 'ARCHIVE' | 'ACTIVE'
}

export interface LastPaymentReceived {
  amount: number
  received_on: string
  payment_id: string
}

export interface PaymentReminder {
  reminder_id: string
  patient_id: string
  notes: string
  patient_name: string
  date: string
  time: string
  amount: string
  title: string
  aligner_journey_id?: string
}
