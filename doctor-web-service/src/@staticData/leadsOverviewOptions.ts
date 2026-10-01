import leadsOverviewConstants from '@constants/leadsOverview.constants'
import OrdersIcon from 'assets/icons/ThreeDotIcons'
import PatientIcon from 'assets/icons/PatientIcon'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import PulseIcon from 'assets/icons/PulseIcon'

export const leadsOverviewOptions = {
  [leadsOverviewConstants.ASSESSMENT]: {
    trigger: 'Assessment',

    icon: PatientIcon,
  },
  [leadsOverviewConstants.ORDERS]: {
    trigger: 'Send a case',

    icon: OrdersIcon,
  },
  [leadsOverviewConstants.SETUP_TREATMENT]: {
    trigger: 'Treatment plan',
    additionalNote: '',
    title: 'Treatment plan',
    description: 'Create and confirm a personalized treatment plan for your patient.',
    icon: ClipBoardIcon,
  },
  [leadsOverviewConstants.ADD_TRACKING]: {
    trigger: 'Start tracking your patient',
    additionalNote: '',
    title: 'Start tracking your patient',
    description: 'Select tracking method details to track your patient’s progress.',
    icon: PulseIcon,
  },
}
