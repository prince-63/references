export interface listType {
  icon: React.ReactNode
  title: string
  value?: string
}

export interface PaymentsData {
  patient_id: number
  doctor_id: number
  cost: number
  balance_payment: number
  payments: PaymentDetail[]
  reminders: PaymentRemindersDetail[]
}

export interface PaymentRemindersDetail {
  reminder_id?: number
  patient_id: number
  doctor_id: number
  date: string
  timezone: string
  time: string
  note: string
  amount: number
}

export interface PaymentDetail {
  payment_id: number
  amount: string
  name: string
  created_at: string
  date: string
}

export interface PostPaymentDetail {
  payment_id?: number
  patient_id: number
  doctor_id: number
  name: string
  amount: string
  date: string
}

export interface PostPaymentReminderDetail {
  reminder_id?: number
  patient_id: number
  doctor_id: number
  date: string
  timezone?: string
  time?: string
  note?: string
  amount?: string
}
