import profileRouteConstants from '@constants/profile.routeConstants'
import {ClipboardList, FileBox, FolderPen, Layers} from 'lucide-react'

export default [
  {
    value: profileRouteConstants.CUSTOMER_PLANS,
    path: 'plans',
    label: 'Plans',
    index: true,
    icon: Layers,
  },
  {
    value: profileRouteConstants.VIEW_ORDER,
    path: 'order',
    label: 'Case Details',
    index: false,
    icon: FileBox,
  },
  {
    value: profileRouteConstants.CUSTOMER_CASE_RECORD,
    path: 'records',
    label: 'Records',
    index: false,
    icon: FolderPen,
  },
  {
    value: profileRouteConstants.CUSTOMER_PRESCRIPTION,
    path: 'prescriptions-list',
    label: 'Prescriptions',
    index: false,
    icon: ClipboardList,
  },
]
