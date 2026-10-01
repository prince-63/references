import profileRouteConstants from '@constants/profile.routeConstants'

export default [
  {
    value: profileRouteConstants.VSP_PLANS,
    path: 'plans',
    label: 'Plans',
  },
  {
    value: profileRouteConstants.CASE_DETAILS,
    path: 'case-details',
    label: 'Case Details',
  },
  {
    value: profileRouteConstants.VSP_CASE_RECORD,
    path: 'records',
    label: 'Records',
  },
  {
    value: profileRouteConstants.VSP_PRESCRIPTION,
    path: 'prescriptions',
    label: 'Prescriptions',
  },
  {
    value: profileRouteConstants.VSP_TREATMENT_SUMMARY,
    path: 'plans/view-plan',
  },
  {
    value: profileRouteConstants.VSP_TREATMENT_SUMMARY,
    path: 'plans/view-plan/:treatmentId',
  },
  {
    value: profileRouteConstants.VSP_PRODUCTION,
    path: 'production',
    label: 'Production',
  },
  {
    value: profileRouteConstants.VSP_TRACKING,
    path: 'tracking',
    label: 'Tracking',
  },
  {
    value: profileRouteConstants.VSP_RETENTION,
    path: 'retention',
    label: 'Retention',
  },
]
