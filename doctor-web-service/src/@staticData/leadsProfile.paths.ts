import routeConstants from '@constants/leadsProfile.routeConstants'
import patientAppointmentFilterRouteConstants from '@constants/patient.appointmentFilter.route.constants'

export default [
  {
    value: routeConstants.OVERVIEW,
    path: '',
    index: true,
  },
  {
    value: routeConstants.VIEW_CASE_INFORMATION,
    path: 'case-information-details',
    index: true,
  },
  {
    value: routeConstants.ADD_CASE_INFORMATION,
    path: 'add-case-information-details',
    index: true,
  },
  {
    value: routeConstants.APPOINTMENTS,
    path: 'appointments',
    children: [
      {
        value: patientAppointmentFilterRouteConstants.ALL,
        path: '',
        index: true,
      },
      {
        value: patientAppointmentFilterRouteConstants.UPCOMING,
        path: 'upcoming',
        index: false,
      },
      {
        value: patientAppointmentFilterRouteConstants.PAST,
        path: 'past',
        index: false,
      },
    ],
    index: false,
  },
  {
    value: routeConstants.BRACES_NOTES,
    path: ':bracesJourneyId/bracesNotes',
    index: false,
  },
  {
    value: routeConstants.ADD_APPOINTMENT,
    path: ':bracesJourneyId/bracesNotes/attachNotes',
    index: false,
  },
  {
    value: routeConstants.VIEW_APPOINTMENT,
    path: ':bracesJourneyId/bracesNotes/viewNotes',
    index: false,
  },
  {
    value: routeConstants.CLEAR_ALIGNERS,
    path: 'treatment',
    index: false,
  },

  {
    value: routeConstants.ADD_TRACKING,
    path: 'treatment/tracking-method',
    index: false,
  },
  {
    value: routeConstants.VIEW_TRACKING,
    path: 'treatment/view-tracking',
    index: false,
  },
  {
    value: routeConstants.REVIEW_TRACKING_DETAILS,
    path: 'treatment/review-tracking-details',
    index: false,
  },
  {
    value: routeConstants.ALIGNERS_TRACKING,
    path: ':alignerJourneyId/alignersTracking',
    index: false,
  },
  {
    value: routeConstants.FILES,
    path: 'files/*',
    index: false,
    children: [
      {
        value: routeConstants.FILES_SUMMARY,
        path: '*',
        index: false,
      },
    ],
  },
  {
    value: routeConstants.SETUP_TREATMENT_PLAN,
    path: 'treatment/:treatmentId/setupTreatmentPlan',
    index: false,
  },
  {
    value: routeConstants.VIEW_TREATMENT_PLAN,
    path: 'treatment/:treatmentId/viewTreatmentPlan',
    index: false,
  },
  {value: routeConstants.CLEAR_ALIGNERS, path: 'treatment', index: false},
  {
    value: routeConstants.VIEW_ALIGNER_CHANGES,
    path: ':alignerJourneyId/alignersTracking/viewAlignerChanges',
    index: false,
  },
  {
    value: routeConstants.ALIGNER_CHANGE_DETAILS,
    path: ':alignerJourneyId/alignersTracking/viewAlignerChanges/:alignerActionId',
    index: false,
  },
  {
    value: routeConstants.WEAR_STATS,
    path: ':alignerJourneyId/wear-stats',
    index: false,
  },
  {
    value: routeConstants.SETUP_TREATMENT_PLAN_BRACES,
    path: 'treatment/braces/:treatmentId/setupTreatmentPlanBraces',
    index: false,
  },
  {
    value: routeConstants.VIEW_TREATMENT_PLAN_BRACES,
    path: 'treatment/braces/:treatmentId/viewTreatmentPlanBraces',
  },
  {
    value: routeConstants.TIMELINE,
    path: 'timeline',
    index: false,
  },
  {
    value: routeConstants.PAYMENTS,
    path: 'payments',
    index: false,
  },
  {
    value: routeConstants.PAYMENT_REMINDERS,
    path: 'payments/paymentReminders',
    index: false,
  },
  {
    value: routeConstants.ORDERS,
    path: 'orders',
    index: false,
  },
  {
    value: routeConstants.TREATMENT_STARTED_INTRO,
    path: 'starting-treatment',
    index: false,
  },
]
