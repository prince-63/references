import userFilterRouteConstants from '@constants/userFilter.route.constants'

export default [
  {
    value: userFilterRouteConstants.USERS,
    path: '',
    label: 'Users',
    index: true,
  },
  {
    value: userFilterRouteConstants.ROLES,
    path: 'roles',
    label: 'Roles',
    index: true,
  },
]
