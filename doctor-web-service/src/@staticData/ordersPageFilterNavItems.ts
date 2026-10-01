import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'

export default [
  {
    value: ordersPageFilterBarConstants.RECEIVED,
    label: 'Received',
    index: true,
    path: '',
  },
  {
    value: ordersPageFilterBarConstants.CUSTOMER,
    label: 'Customer orders ',
    index: false,
    path: 'customerOrders',
  },
  {
    value: ordersPageFilterBarConstants.SENT,
    label: 'Lab orders ',
    index: false,
    path: 'sent',
  },
]
