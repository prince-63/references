import patientsFilterConstants from '@constants/patientsFilter.constants'

export default [
  {
    value: patientsFilterConstants.ALL,
    label: 'All',
    index: true,
    path: 'all',
  },
  {
    value: patientsFilterConstants.LEADS,
    label: 'Leads',
    index: false,
    path: 'lead',
  },
  {
    value: patientsFilterConstants.ACTIVE,
    label: 'Active',
    index: false,
    path: 'active',
  },
]
