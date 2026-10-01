import profileRouteConstants from '@constants/profile.routeConstants'

export default [
  {
    value: profileRouteConstants.TASK,
    path: '',
    label: 'Overview',
  },

  {
    value: profileRouteConstants.DETAILS,
    path: 'details',
    label: 'Details',
    children: [
      {
        value: profileRouteConstants.CASE_FILES,
        path: 'case-files',
        label: 'Case Files',
      },
      {
        value: profileRouteConstants.PATIENT_DETAILS,
        path: 'patient-details',
        label: 'Patient Details',
      },
      {
        value: profileRouteConstants.PRESCRIPTIONS,
        path: 'prescriptions',
        label: 'Prescriptions',
      },
    ],
  },
  {
    value: profileRouteConstants.ORDERS,
    path: 'orders',
    label: 'Orders',
  },
  {
    value: profileRouteConstants.APPOINTMENTS,
    path: 'bracesNotes',
    label: 'Appointment Notes',
  },
  {
    value: profileRouteConstants.PLANS,
    path: 'plans-list',
    label: 'Plans',
  },
  {
    value: profileRouteConstants.PRODUCTION,
    path: 'production',
    label: 'Production',
  },
  {
    value: profileRouteConstants.TRACKING,
    path: 'aligner-tracking',
    label: 'Tracking',
  },
  {
    value: profileRouteConstants.ACTIVITY_LOGS,
    path: 'activity-logs',
    label: 'Activity Logs',
    children: [
      {
        value: profileRouteConstants.NOTES,
        path: 'notes',
        label: 'Notes',
      },
      {
        value: profileRouteConstants.AUDIT_LOGS,
        path: 'audit-logs',
        label: 'Audit Logs',
      },
      {
        value: profileRouteConstants.COMMENTS,
        path: 'comments',
        label: 'Comments',
      },
    ],
  },
  {
    value: profileRouteConstants.PAYMENT,
    path: 'payments',
    label: 'Payments',
  },
  {
    value: profileRouteConstants.CHAT,
    path: 'chat',
    label: 'Chat',
  },
]
