import routeConstants from '@constants/settings.routeConstants'

export default [
  {
    value: routeConstants.ACCOUNT,
    path: '',
    index: true,
    label: 'Account',
  },
  {
    value: routeConstants.BILLING,
    path: 'billing',
    index: false,
    label: 'Billing',
  },
  {
    value: routeConstants.PROFILE_MANAGEMENT,
    path: 'profileManagement',
    index: false,
    label: 'Profile management',
  },
  {
    value: routeConstants.SUBSCRIPTION,
    path: 'subscription',
    index: false,
    label: 'Subscription',
  },
  {
    value: routeConstants.CASE_TEAM,
    path: 'case-team',
    index: false,
    label: 'Case Team',
  },
  {
    value: routeConstants.WORKFLOW_MANAGEMENT,
    path: 'workflow-management',
    index: false,
    label: 'Configurations',
    children: [
      {
        value: routeConstants.ADD_ONS,
        path: 'add-ons',
        index: false,
        label: 'Add-Ons',
      },
      {
        value: routeConstants.OVERVIEW,
        path: 'overview',
        index: false,
        label: 'Overview',
      },
      {
        value: routeConstants.SERVICES,
        path: 'services',
        index: false,
        label: 'Products and Services',
      },
      {
        value: routeConstants.WORKFLOW,
        path: 'workflow',
        index: false,
        label: 'Workflow',
      },
      {
        value: routeConstants.CARD_DISPLAY,
        path: 'card-display',
        index: false,
        label: 'Card display',
      },
    ],
  },
  // {
  //   value: routeConstants.USER_MANAGEMENT,
  //   path: 'user-management',
  //   index: false,
  //   label: 'User management',
  //   children: [
  //     {
  //       value: userFilterRouteConstants.USERS,
  //       path: '',
  //       index: true,
  //     },
  //     {
  //       value: userFilterRouteConstants.ROLES,
  //       path: 'roles',
  //       index: false,
  //     },
  //   ],
  // },
  // {
  //   value: routeConstants.REWARDS_CONFIGURATION,
  //   path: 'rewards-configuration',
  //   index: false,
  //   label: 'Rewards Configuration',
  // },
  {
    value: routeConstants.STORAGE,
    path: 'storage',
    index: false,
    label: 'Storage',
  },
]
