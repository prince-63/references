import accessControlRouteConstants from '@constants/accessControl.route.constants'

const accessControlFilterRouteNavConstants = [
  {
    value: accessControlRouteConstants.OVERVIEW,
    path: '',
    label: 'Overview',
    index: true,
  },
  {
    value: accessControlRouteConstants.USERS,
    path: 'users',
    label: 'Users',
  },
  {
    value: accessControlRouteConstants.LABS,
    path: 'labs',
    label: 'Labs',
  },
  {
    value: accessControlRouteConstants.ROLES,
    path: 'roles',
    label: 'Roles & Permissions',
  },
  {
    value: accessControlRouteConstants.AUDIT,
    path: 'audit-logs',
    label: 'Audit Logs',
  },
]
export default accessControlFilterRouteNavConstants
