import profileRouteConstants from '@constants/profile.routeConstants'
import {ClipboardList, FolderPen, Layers, User2} from 'lucide-react'

export default [
  {
    value: profileRouteConstants.VSP_PLANS,
    path: 'plans',
    label: 'Plans',
    index: true,
    icon: Layers,
  },
  {
    value: profileRouteConstants.VSP_TREATMENT_SUMMARY,
    path: 'case-summary',
    label: 'Case Details',
    index: true,
    icon: User2,
  },
  {
    value: profileRouteConstants.VSP_CASE_RECORD,
    path: 'records',
    label: 'Records',
    index: false,
    icon: FolderPen,
  },
  {
    value: profileRouteConstants.VSP_PRESCRIPTION,
    path: 'prescriptions-list',
    label: 'Prescriptions',
    index: false,
    icon: ClipboardList,
  },
]
