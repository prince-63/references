import CheckIcon from 'assets/icons/CheckIcon'
import {ISubscriptionDetails} from 'components/subscription/subscription.types'
import {ReactNode} from 'react'

export default (subscriptionData: ISubscriptionDetails) =>
  [
    {
      icon: CheckIcon,
      title: `Access web portal and Doctor app`,
      checked: true,
    },
    {
      icon: CheckIcon,
      title: 'Patients track their treatment progress with the app',
      checked: true,
    },
    {
      icon: CheckIcon,
      title: `Manage up to ${subscriptionData?.total_patients ?? 0} active patients`,
      checked: true,
    },
    {
      icon: CheckIcon,
      title: `Store up to ${subscriptionData?.total_storage_gb ?? 0} GB of data`,
      checked: true,
    },
    {icon: CheckIcon, title: 'Monitor aligner changes across multiple brands', checked: true},
    {icon: CheckIcon, title: 'Track records and payments with reminders', checked: true},
    {
      icon: CheckIcon,
      title: 'Review complete treatment summaries before appointments',
      checked: true,
    },
    {icon: CheckIcon, title: 'Chat and broadcast using pre-set templates', checked: true},
  ] as {icon: React.FC; title: ReactNode; checked?: boolean}[]
