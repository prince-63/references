import orderFilterConstants from '@constants/orderFilter.constants'

export default [
  {label: 'All ', value: orderFilterConstants.ALL},
  {label: 'Ordered ', value: orderFilterConstants.ORDERED},
  {label: 'In Progress ', value: orderFilterConstants.IN_PROGRESS},
  {label: 'In Review ', value: orderFilterConstants.IN_REVIEW},
  {label: 'Re-Plan', value: orderFilterConstants.RE_PLAN},
  {label: 'Approved ', value: orderFilterConstants.APPROVED},
  {label: 'STL Files requested ', value: orderFilterConstants.STL_FILES_REQUESTED},
  {label: 'STL Files uploaded ', value: orderFilterConstants.STL_FILES_UPLOADED},
  {label: 'Completed ', value: orderFilterConstants.COMPLETED},
]
