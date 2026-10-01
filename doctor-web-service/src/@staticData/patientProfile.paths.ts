import profileRouteConstants from '@constants/profile.routeConstants'

export default [
  {
    value: profileRouteConstants.TASK,
    path: '',
    index: true,
  },

  {
    value: profileRouteConstants.DETAILS,
    path: 'details',

    children: [
      {
        value: profileRouteConstants.PATIENT_DETAILS,
        path: 'patient-details',
        label: 'Patient Details',
      },
      {
        value: profileRouteConstants.CASE_FILES,
        path: 'case-files',
        label: 'Case files',
      },
      {
        value: profileRouteConstants.PRESCRIPTIONS,
        path: 'prescriptions',
        label: 'Prescriptions',
      },
      // Dedicated pages for Add/Edit Prescription
      {
        value: profileRouteConstants.PRESCRIPTION_NEW,
        path: 'prescriptions/new',
        index: false,
      },
      {
        value: profileRouteConstants.PRESCRIPTION_EDIT,
        path: 'prescriptions/:prescriptionId/edit',
        index: false,
      },
    ],
  },

  {
    value: profileRouteConstants.ORDERS,
    path: 'orders',
    index: false,
  },
  {
    value: profileRouteConstants.APPOINTMENTS,
    path: 'bracesNotes/:bracesJourneyId',
    index: false,
  },
  {
    value: profileRouteConstants.ADD_APPOINTMENT,
    path: 'bracesNotes/:bracesJourneyId/attachNotes',
    index: false,
  },
  {
    value: profileRouteConstants.VIEW_APPOINTMENT,
    path: 'bracesNotes/:bracesJourneyId/viewNotes',
    index: false,
  },
  {
    value: profileRouteConstants.PLANS,
    path: 'plans-list',
    index: false,
  },
  {
    value: profileRouteConstants.VIEW_TREATMENT_PLAN,
    path: 'view-plan',
    index: false,
  },

  {
    value: profileRouteConstants.VIEW_TREATMENT_PLAN,
    path: 'view-plan/:treatmentId',
    index: false,
  },
  {
    value: profileRouteConstants.FILES,
    path: 'files/*',
    index: false,
    children: [
      {
        value: profileRouteConstants.FILES_SUMMARY,
        path: '*',
        index: false,
      },
    ],
  },
  // {
  //   value: profileRouteConstants.WORKFLOW,
  //   path: 'workflow',
  //   index: false,
  // },

  {
    value: profileRouteConstants.PRODUCTION,
    path: 'production',
    index: false,
  },
  {
    value: profileRouteConstants.PRODUCTION_BATCH_DETAILS,
    path: 'production/batch/:treatmentId/:batchId',
    index: false,
  },
  {
    value: profileRouteConstants.TRACKING,
    path: 'aligner-tracking',
    index: false,
  },
  {
    value: profileRouteConstants.TREATMENT_STARTED_INTRO,
    path: 'starting-treatment',
    index: false,
  },
  {
    value: profileRouteConstants.ACTIVITY_LOGS,
    path: 'activity-logs',
    children: [
      {
        value: profileRouteConstants.NOTES,
        path: 'notes',
        label: 'Internal Notes',
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
    value: profileRouteConstants.PAYMENT_REMINDERS,
    path: 'payments/paymentReminders',
    index: false,
  },
  {
    value: profileRouteConstants.CHAT,
    path: 'chat',
    index: false,
  },
  {
    value: profileRouteConstants.WEAR_STATS,
    path: 'aligner-tracking/:alignerJourneyId/wear-stats',
    index: false,
  },
]
