import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'

export type PlanDataList = {
  total_plans: number
  approved: number
  pending_approval: number
  total_hours: number
  plans_list: NewPlanData[]
}

export type NewPlanData = {
  order_id: string
  plan_id: number
  version: string
  description: string
  stages: string
  upper_aligner_series: string
  lower_aligner_series: string
  planning_link: string | null
  instructions: string | null
  plan_files: IFile[]
  upload_date: string | null
  approved_date: string | null
  created_date: string | null
  wear_days: number
  duration: number
  stl_files: IFile[]
  initiator_status: keyof typeof treatmentPlanStatusConstants | 'IN_PROGRESS'
  approver_status: keyof typeof treatmentPlanStatusConstants
  status: keyof typeof treatmentPlanStatusConstants
  difficulty: string | null
  treatment_plan_name: string | null
  treatment_plan_tag_name: string | null
  doctor_id: number
  order_status_changed_at: string | null
  manufacturing_service_product: Product | null
  treatment_plan_metadata?: {
    replan_reason?: string | null
    replan_requested_on?: string | null
  } | null

  is_treatment_plan_created_on_cloned_order: boolean
  parent_order_id: string | null
  order_type: string
  total_file_count?: number | null
}
