import ordersPageFilterBarConstants from '@constants/ordersPageFilterBar.constants'

export default [
  {
    value: ordersPageFilterBarConstants.PRACTICE,
    label: 'Practice patients ',
    index: true,
    path: 'practicePatients',
  },
  {
    value: ordersPageFilterBarConstants.CUSTOMER,
    label: 'Customer patients ',
    index: false,
    path: 'customerPatients',
  },
]
