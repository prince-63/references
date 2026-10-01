import orderNewFilterConstants from '@constants/orderNewFilter.constants'

export default [
  {label: 'All ', value: orderNewFilterConstants.ALL},
  {label: 'Draft ', value: orderNewFilterConstants.DRAFT},
  {label: 'Ordered ', value: orderNewFilterConstants.ORDERED},
  {label: 'Need more info', value: orderNewFilterConstants.NEED_MORE_INFO},
  {label: ' Plan In Progress ', value: orderNewFilterConstants.IN_PROGRESS},
  {label: 'Plan In Review ', value: orderNewFilterConstants.IN_REVIEW},
  {label: 'Re-Plan', value: orderNewFilterConstants.RE_PLAN},
  {label: 'Plan Approved ', value: orderNewFilterConstants.APPROVED},
  {label: 'STL Files requested ', value: orderNewFilterConstants.STL_FILES_REQUESTED},
  {label: 'STL Files uploaded ', value: orderNewFilterConstants.STL_FILES_UPLOADED},
  {label: 'Completed ', value: orderNewFilterConstants.COMPLETED},
  {label: 'Transit ', value: orderNewFilterConstants.IN_TRANSIT},
  {label: 'Delivered ', value: orderNewFilterConstants.DELIVERED},
  {label: 'Manufacturing Pending', value: orderNewFilterConstants.MANUFACTURE_IN_PENDING},
  {label: 'Manufacturing In Progress', value: orderNewFilterConstants.MANUFACTURE_IN_PROGRESS},
  {label: 'Manufacturing Completed', value: orderNewFilterConstants.MANUFACTURE_IN_COMPLETE},
  {label: 'Cancelled', value: orderNewFilterConstants.CANCELLED},
]
