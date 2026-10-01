import customerPatientStatTypesConstants from '@constants/customerPatientStatTypes.constants'

export default [
  {
    label: 'Patients',
    value: customerPatientStatTypesConstants.PATIENTS,
    mappedKey: 'total_patients',
  },
  {
    label: 'Orders',
    value: customerPatientStatTypesConstants.ORDERS,
    mappedKey: 'total_orders',
  },
  {
    label: 'Last Order At',
    value: customerPatientStatTypesConstants.LAST_ORDER_AT,
    mappedKey: 'latest_order',
  },

  {
    label: 'Tracking',
    value: customerPatientStatTypesConstants.TRACKING,
    mappedKey: 'tracking_enabled',
  },
]
