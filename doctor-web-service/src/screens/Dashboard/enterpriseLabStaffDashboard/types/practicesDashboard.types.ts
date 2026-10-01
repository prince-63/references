export interface OrderCounts {
  total: number
  draft: number
  ordered: number
  in_review: number
  in_progress: number
  replan: number
  approved: number
  completed: number
  stl_files_requested: number
  stl_files_uploaded: number
  need_more_info: number
  cancelled: number
}

interface OrderTasks {
  in_progress: number
  review_assigned_orders_to_me: number
}

interface OrderNeedsAttention {
  urgent_orders: number
  in_re_plan: number
  due_today: number
  overdue: number
  stl_files_requested: number
  not_added_due_by: number
}

interface CustomerActionPending {
  active: number
  invited: number
  in_review: number
  approved: number
  stl_files_uploaded: number
}

interface OrderDetails {
  count: OrderCounts
  my_task: OrderTasks
  need_attention: OrderNeedsAttention
  customer_action_pending: CustomerActionPending
}

export interface IEnterpriseLabStaffCountsData {
  practice_order: OrderDetails
  customer_orders: OrderDetails
  lab_order: OrderDetails
}
