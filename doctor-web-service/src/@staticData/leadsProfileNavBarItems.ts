import leadsProfileRouteConstants from '@constants/leadsProfile.routeConstants'

export default [
  {
    value: leadsProfileRouteConstants.OVERVIEW,
    path: '',
    label: 'Overview',
  },
  {
    value: leadsProfileRouteConstants.ORDERS,
    path: 'orders',
    label: 'Orders',
  },
  {
    value: leadsProfileRouteConstants.SETUP_TREATMENT_PLAN,
    path: 'treatment',
    label: 'Treatment plans',
  },
  {
    value: leadsProfileRouteConstants.ALIGNERS_TRACKING,
    path: 'alignersTracking',
    label: 'Aligner movement table',
  },
  // {
  //   value: leadsProfileRouteConstants.APPOINTMENTS,
  //   path: 'appointments',
  //   label: 'Appointments',
  // },
  {
    value: leadsProfileRouteConstants.BRACES_NOTES,
    path: 'bracesNotes',
    label: 'Appointment notes',
  },
  {
    value: leadsProfileRouteConstants.PAYMENTS,
    path: 'payments',
    label: 'Payments',
  },
  {
    value: leadsProfileRouteConstants.FILES,
    path: 'files',
    label: 'Files',
  },

  {
    value: leadsProfileRouteConstants.TIMELINE,
    path: 'timeline',
    label: 'Timeline',
  },
]
