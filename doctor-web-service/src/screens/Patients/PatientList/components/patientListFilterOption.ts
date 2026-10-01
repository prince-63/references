import patientListRouteTypes from './types/patientListRouteTypes'

export default [
  {
    label: 'Leads',
    value: patientListRouteTypes.LEADS,
    path: 'leads',
  },
  {
    label: 'Aligners',
    value: patientListRouteTypes.ALIGNERS,
    path: 'aligners',
  },
  {
    label: 'Braces',
    value: patientListRouteTypes.BRACES,
    path: 'braces',
  },
]
