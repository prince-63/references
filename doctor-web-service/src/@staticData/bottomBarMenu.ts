import DashboardBottomBarIcon from 'assets/icons/DashboardBottomBarIcon'
import PatientsBottomBarIcon from 'assets/icons/PatientsBottomBarIcon'
import ChatsBottomBarIcon from 'assets/icons/ChatsBottomBarIcon'
import MoreBottomBarIcon from 'assets/icons/MoreBottomBarIcon'
import FirstAidDashboardIcon from 'assets/icons/FirstAidDashboardIcon'
import bottomBarFilterOptionConstants from '@constants/bottomBarFilterOption.constants'

export default [
  {
    label: 'Dashboard',
    value: bottomBarFilterOptionConstants.DASHBOARD,
    icon: DashboardBottomBarIcon,
    path: '/',
  },

  {
    label: 'Patients',
    value: bottomBarFilterOptionConstants.PATIENTS,
    icon: PatientsBottomBarIcon,
    path: '/patients-list',
  },
  {
    label: 'Chats',
    value: bottomBarFilterOptionConstants.CHATS,
    icon: ChatsBottomBarIcon,
    path: '/chat-list',
  },
  {
    label: 'Lab Chat',
    value: bottomBarFilterOptionConstants.LAB_CHAT,
    icon: ChatsBottomBarIcon,
    path: '/lab-chat',
  },
  {
    label: 'Customers',
    value: bottomBarFilterOptionConstants.CUSTOMERS,
    path: '/Customers',
    icon: FirstAidDashboardIcon,
  },

  {
    label: 'More',
    value: bottomBarFilterOptionConstants.MORE,
    icon: MoreBottomBarIcon,
    path: '',
  },
]
