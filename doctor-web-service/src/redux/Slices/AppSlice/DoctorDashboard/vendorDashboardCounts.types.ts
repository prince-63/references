import {IOngoingOrders} from './dashboardCounts.types'

export interface IVendorDashboardCounts {
  count: IOngoingOrders
  task: {
    new_order: number
    in_progress: number
    review_assigned_orders_to_me: number
    unassigned_orders: number
    urgent_orders: number
  }
  needs_attention: {
    in_replan: number
    stl_file_requested: number
    due_today: number
    overdue: number
    urgent_orders: number
    not_added_due_by: number
  }
  getting_started: {
    customer_count: number
    user_count: number
    invited_lab_staff_count: number
    active_lab_staff_count: number
    invited_customer_count: number
    active_customer_count: number
    company_details_added: boolean
    brand_details_added: boolean
    customer_action_pending: number
    user_action_pending: number
  }
}

export interface OrderCounts {
  total?: number
  ordered?: number
  in_progress?: number
  in_review?: number
  onhold?: number
  replan?: number
  approved?: number
  completed?: number
  draft?: number
  cancelled?: number
  stl_file_requested?: number
  stl_file_approved?: number
}
