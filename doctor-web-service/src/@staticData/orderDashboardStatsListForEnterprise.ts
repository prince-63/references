import orderStatusConstants from '@constants/orderStatus.constants'

export default [
  {
    label: 'All',
    value: orderStatusConstants.ALL,
    color: '#F5F5F5',
    mappedKey: 'total',
  },
  {
    label: 'Draft',
    value: orderStatusConstants.DRAFT,
    color: '#6B7280',
    mappedKey: 'draft',
  },
  {
    label: 'Ordered',
    value: orderStatusConstants.ORDERED,
    color: '#0EA5E9',
    mappedKey: 'ordered',
  },
  {
    label: 'Need more info',
    value: orderStatusConstants.NEED_MORE_INFO,
    color: '#C88F3F',
    mappedKey: 'need_more_info',
  },
  {
    label: 'In Progress',
    value: orderStatusConstants.IN_PROGRESS,
    color: '#F97316',
    mappedKey: 'in_progress',
  },
  {
    label: 'In Review',
    value: orderStatusConstants.IN_REVIEW,
    color: '#8B5CF6',
    mappedKey: 'in_review',
  },
  {
    label: 'Re-plan',
    value: orderStatusConstants.RE_PLAN,
    color: '#E53935',
    mappedKey: 'replan',
  },
  {
    label: 'Approved',
    value: orderStatusConstants.APPROVED,
    color: '#22C55E',
    mappedKey: 'approved',
  },
  {
    label: 'STL files requested',
    value: orderStatusConstants.STL_FILES_REQUESTED,
    color: '#EAB308',
    mappedKey: 'stl_files_requested',
  },
  {
    label: 'STL files uploaded',
    value: orderStatusConstants.STL_FILES_UPLOADED,
    color: '#06B6D4',
    mappedKey: 'stl_files_uploaded',
  },
  {
    label: 'Completed',
    value: orderStatusConstants.COMPLETED,
    color: '#059669',
    mappedKey: 'completed',
  },
  {
    label: 'Cancelled',
    value: orderStatusConstants.CANCELLED,
    color: '#AE2241',
    mappedKey: 'cancelled',
  },
]
