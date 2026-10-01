import routeConstants from '@constants/sidebar.routeConstants'

export default [
  {
    name: 'Dashboard',
    value: routeConstants.DASHBOARD,
    path: '/',
    index: true,
  },
  {
    name: 'Practice Location',
    value: routeConstants.PRACTICE_LOCATION,
    path: '/practice-location-list',
    index: false,
  },
  {
    name: 'Patients',
    value: routeConstants.PATIENTS,
    path: '/patients-list',
    index: false,
  },

  {
    name: 'Chat',
    value: routeConstants.CHAT,
    path: '/chat-list',
    index: false,
  },
  {
    name: 'Lab Chat',
    value: routeConstants.LAB_CHAT,
    path: '/lab-chat',
    index: false,
  },
  // {
  //   name: 'Settings',
  //   value: routeConstants.SETTINGS,
  //   path: '/settings',
  //   index: false,
  // },
  {
    name: 'Notifications',
    value: routeConstants.NOTIFICATIONS,
    path: '/notifications',
    index: false,
  },

  {
    name: 'Support',
    value: routeConstants.SUPPORT,
    path: '',
    index: false,
  },
  {
    name: 'Calendar',
    value: routeConstants.CALENDAR,
    path: '/calendar',
    index: false,
  },
  {
    name: 'Billing & Payments',
    value: routeConstants.BILLINGS_AND_PAYMENTS,
    path: '/billings',
    index: false,
  },
  {
    name: 'Ongoing Production',
    value: routeConstants.PRODUCTION,
    path: '/aligner-production',
    index: false,
  },
  {
    name: 'Settings',
    value: routeConstants.SETTINGS,
    path: '/settings',
    index: false,
  },
  {
    name: 'Rewards',
    value: routeConstants.REWARDS,
    path: '/rewards',
    index: false,
  },
  // {
  //   name: 'Practices',
  //   value: routeConstants.PRACTICES,
  //   path: '/practices',
  //   index: false,
  // },
  {
    name: 'Orders',
    value: routeConstants.ORDERS,
    path: '/orders',
    index: false,
  },
  {
    name: 'Aligner orders',
    value: routeConstants.ALIGNER_ORDERS,
    path: `/aligner-orders`,
    index: false,
  },
  {
    name: 'Unprocessed',
    value: routeConstants.UNPROCESSED_ORDERS,
    path: '/unprocessed-orders',
    index: false,
  },
  {
    name: 'AI Smile',
    value: routeConstants.SMILE_SIMULATION,
    path: '/smile-simulation',
    index: false,
  },
  {
    name: 'Customers',
    value: routeConstants.CUSTOMERS,
    path: '/customers',
    index: false,
  },

  {
    name: 'Labs',
    value: routeConstants.LABS,
    path: '/labs',
    index: false,
  },
  {
    name: 'Aligner patient analytics',
    value: routeConstants.ALIGNER_ANALYTICS_CHILD,
    path: '/aligner-patient-analytics',
    index: false,
  },
  {
    name: 'Aligner tracking',
    value: routeConstants.ALIGNER_TRACKING,
    path: '/aligner-tracking',
    index: false,
  },
  {
    name: 'Access Control',
    value: routeConstants.ACCESS_CONTROL,
    path: '/access-control/',
    index: false,
  },

  // KANBAN
  //Aligner
  {
    name: 'New Case',
    value: routeConstants.CHILD_NEW_CASE,
    path: '/aligner-orders?workFlow=new-case',
    index: true,
  },
  {
    name: 'Planning In House',
    value: routeConstants.CHILD_ALIGNER_PLANNING_IN_HOUSE,
    path: '/aligner-orders?workFlow=planning-in-house',
    index: false,
  },
  {
    name: 'Planning Outsource',
    value: routeConstants.CHILD_ALIGNER_PLANNING_OUTSOURCE,
    path: '/aligner-orders?workFlow=planning-outsource',
    index: false,
  },
  {
    name: 'Production In House',
    value: routeConstants.CHILD_ALIGNER_PRODUCTION_IN_HOUSE,
    path: '/aligner-orders?workFlow=production-in-house',
    index: false,
  },
  {
    name: 'Production Outsource',
    value: routeConstants.CHILD_ALIGNER_PRODUCTION_OUTSOURCE,
    path: '/aligner-orders?workFlow=production-outsource',
    index: false,
  },
  // Planning
  {
    name: 'Planning In House',
    value: routeConstants.CHILD_PLANNING_IN_HOUSE,
    path: '/aligner-orders?workFlow=planning-in-house',
    index: true,
  },
  {
    name: 'Planning Outsource',
    value: routeConstants.CHILD_PLANNING_OUTSOURCE,
    path: '/aligner-orders?workFlow=planning-outsource',
    index: false,
  },

  {
    name: 'Manufacturing Orders',
    value: routeConstants.MANUFACTURING_ORDERS_KANBAN,
    path: '/manufacturing-orders',
    index: false,
    children: [
      {
        name: 'Production In House',
        value: routeConstants.CHILD_PRODUCTION_IN_HOUSE,
        path: '/manufacturing-orders/production-in-house',
        index: false,
      },
      {
        name: 'Production Outsource',
        value: routeConstants.CHILD_PRODUCTION_OUTSOURCE,
        path: '/manufacturing-orders/production-outsource',
        index: false,
      },
    ],
  },
]
