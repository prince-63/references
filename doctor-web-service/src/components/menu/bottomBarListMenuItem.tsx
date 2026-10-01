import dashboardBottomBarTypes from '@constants/dashboardBottomBarTypes'
import patientFilterOptionListTypeConstant from '@constants/patientFilterOptionListType.constant'

export default [
  {
    label: 'Dashboard',
    value: dashboardBottomBarTypes.DASHBOARD,
    routes: patientFilterOptionListTypeConstant.ALL,
  },
  {
    label: 'Patients',
    value: dashboardBottomBarTypes.PATIENTS,
    listStatus: patientFilterOptionListTypeConstant.ACTIVE,
  },
  {
    label: 'Chats',
    value: dashboardBottomBarTypes.CHATS,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
  {
    label: 'Practices',
    value: dashboardBottomBarTypes.PRACTICES,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
  {
    label: 'Users',
    value: dashboardBottomBarTypes.USERS,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
  {
    label: 'Orders',
    value: dashboardBottomBarTypes.ORDERS,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
  {
    label: 'More',
    value: dashboardBottomBarTypes.MORE,
    listStatus: patientFilterOptionListTypeConstant.INACTIVE,
  },
]
