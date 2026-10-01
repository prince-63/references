import profileRouteConstants from '@constants/profile.routeConstants'

export default [
  {
    value: profileRouteConstants.CUSTOMER_TABS,
    path: '',
    index: true,
    children: [
      {
        value: profileRouteConstants.CUSTOMER_PLANS,
        path: 'plans',
        label: 'Plans',
        index: true,
      },
      {
        value: profileRouteConstants.VIEW_ORDER,
        path: 'order',
        label: 'Case Details',
        index: false,
      },
      {
        value: profileRouteConstants.CUSTOMER_CASE_RECORD,
        path: 'records',
        label: 'Records',
        index: false,
      },
      {
        value: profileRouteConstants.CUSTOMER_PRESCRIPTION,
        path: 'prescriptions-list',
        label: 'Prescriptions',
        index: false,
      },
      {
        value: profileRouteConstants.CUSTOMER_TREATMENT_SUMMARY,
        path: 'plans/view-plan',
        index: false,
      },
      {
        value: profileRouteConstants.CUSTOMER_TREATMENT_SUMMARY,
        path: 'plans/view-plan/:treatmentId',
        index: false,
      },
    ],
  },
]
