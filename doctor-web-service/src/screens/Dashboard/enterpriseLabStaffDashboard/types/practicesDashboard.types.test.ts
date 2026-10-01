import {IEnterpriseLabStaffCountsData, OrderCounts} from './practicesDashboard.types'

const sampleCounts: OrderCounts = {
  total: 30,
  draft: 1,
  ordered: 2,
  in_review: 3,
  in_progress: 4,
  replan: 5,
  approved: 6,
  completed: 7,
  stl_files_requested: 8,
  stl_files_uploaded: 9,
  need_more_info: 10,
  cancelled: 11,
}

const sampleData: IEnterpriseLabStaffCountsData = {
  practice_order: {
    count: sampleCounts,
    my_task: {in_progress: 1, review_assigned_orders_to_me: 2},
    need_attention: {
      urgent_orders: 3,
      in_re_plan: 10,
      due_today: 4,
      overdue: 5,
      stl_files_requested: 6,
      not_added_due_by: 7,
    },
    customer_action_pending: {
      active: 1,
      invited: 1,
      in_review: 2,
      approved: 3,
      stl_files_uploaded: 4,
    },
  },
  customer_orders: {
    count: sampleCounts,
    my_task: {in_progress: 8, review_assigned_orders_to_me: 9},
    need_attention: {
      urgent_orders: 10,
      in_re_plan: 11,
      due_today: 12,
      overdue: 13,
      stl_files_requested: 14,
      not_added_due_by: 15,
    },
    customer_action_pending: {
      active: 5,
      invited: 6,
      in_review: 7,
      approved: 8,
      stl_files_uploaded: 9,
    },
  },
  lab_order: {
    count: sampleCounts,
    my_task: {in_progress: 16, review_assigned_orders_to_me: 17},
    need_attention: {
      urgent_orders: 18,
      in_re_plan: 19,
      due_today: 20,
      overdue: 21,
      stl_files_requested: 22,
      not_added_due_by: 23,
    },
    customer_action_pending: {
      active: 9,
      invited: 10,
      in_review: 11,
      approved: 12,
      stl_files_uploaded: 13,
    },
  },
}

describe('enterpriseLabStaffDashboard types', () => {
  it('covers all count fields used in stat boxes', () => {
    const keys: Array<keyof OrderCounts> = [
      'ordered',
      'in_progress',
      'in_review',
      'replan',
      'approved',
      'stl_files_requested',
      'stl_files_uploaded',
      'completed',
    ]

    keys.forEach((key) => {
      expect(sampleCounts[key]).toBeGreaterThanOrEqual(0)
    })
  })

  it('aligns practice, customer, and lab order shapes', () => {
    expect(sampleData.practice_order.need_attention.in_re_plan).toBe(10)
    expect(sampleData.customer_orders.my_task.review_assigned_orders_to_me).toBe(9)
    expect(sampleData.lab_order.customer_action_pending.stl_files_uploaded).toBe(13)
  })
})
