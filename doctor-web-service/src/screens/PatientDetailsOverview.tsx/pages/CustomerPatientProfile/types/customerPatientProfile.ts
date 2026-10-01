import newOrderStatusConstants from '@constants/newOrderStatus.constants'
import orderStatusConstants from '@constants/orderStatus.constants'
import {ServiceProduct} from 'redux/Slices/AppSlice/workflow/workflow.slice'

export type PendingActions = 'COMPLETE_DRAFT_ORDER' | 'TAKE'
export type PLANNING_STEPS = 'ORDER_DETAILS' | 'REVIEW' | 'STL'
export type STEP_STATUS = 'IN_PROGRESS' | 'DONE' | 'PENDING'

export interface PatientDetails {
  full_name: string
  order_id: string | null
  archived_order_id: string[]
  Lab_name: string
  email: string
  mobile: string
  age: number
  gender: string
}

export interface PatientPayload {
  patient_id: number
  gender: string
  full_name: string
  profile_url: string | null
  profile_image_id: string | null
  age: number
  email: string
  mobile: string
  status: string
  patient_type: string
  added_on: string
  practice_location_name: string | null
  practice_location_id: number | null
  language: string
  org_name: string | null
  country: string
  city: string
  state: string
  customer_mapped_id: string
  country_code: string
  is_invitation_sent: boolean
  invitation_status: 'SENT' | 'NOT_SENT' | 'ACCEPTED' | 'EXPIRED'
  resent_invite_at: string | null
  order_id: string | null
  archived_order_ids: string[]
  created_by: string
  uuid: string
  chat_ids: number[]
  production_status: 'ORDER_CREATED' | 'IN_PRODUCTION' | 'PACKAGED' | 'SHIPPED' | 'DELIVERED'
  customer_name: string | null
  order_status: string | null
  service_product: ServiceProduct
}

export interface PlanningStepper {
  order_id: string | null
  notes: string | null
  pending_review_treatment_count: number | null

  next_action: string | null
  order_status: keyof typeof newOrderStatusConstants | null
  actual_order_status: keyof typeof orderStatusConstants | null
}

export type PlanningStepperData = {
  planning_stepper: {
    current_step: PLANNING_STEPS
    Order_Details: PLANNING_STEPS
    InReviewStep: PLANNING_STEPS
    STL_step: PLANNING_STEPS
  }
}

export type Props = {
  data: PlanningStepperData
  onStepChange?: (step: PLANNING_STEPS) => void
}

export type StepConfig = {
  key: PLANNING_STEPS
  title: string
  index: number
  status: STEP_STATUS
}
