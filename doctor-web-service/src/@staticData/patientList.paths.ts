import routeConstants from '@constants/leadsProfile.routeConstants'

export default [
  {
    value: routeConstants.LEADS,
    path: 'leads',
    index: true,
  },
  {
    value: routeConstants.ALIGNERS,
    path: 'aligners',
    index: false,
  },
  {
    value: routeConstants.BRACES_LIST,
    path: 'braces',
    index: false,
  },
]
