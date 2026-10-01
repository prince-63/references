import CheckIcon from 'assets/icons/CheckIcon'
import {ReactNode} from 'react'

export default () =>
  [
    {
      icon: CheckIcon,
      title: `Access the web portal for seamless order management`,
      checked: true,
    },
    {
      icon: CheckIcon,
      title: 'Add and invite users to collaborate efficiently',
      checked: true,
    },
    {
      icon: CheckIcon,
      title: `Assign users to received orders for streamlined processing`,
      checked: true,
    },
    {
      icon: CheckIcon,
      title: `Add and invite customers to expand your business network`,
      checked: true,
    },
    {
      icon: CheckIcon,
      title: 'Define and manage the services you offer to customers',
      checked: true,
    },
    {
      icon: CheckIcon,
      title: 'Receive, process, and manage design (planning) orders effortlessly',
      checked: true,
    },
    {
      icon: CheckIcon,
      title: 'Track and oversee orders from start to finish',
      checked: true,
    },
    {icon: CheckIcon, title: 'Store up to 1 GB of essential data', checked: true},
  ] as {icon: React.FC; title: ReactNode; checked?: boolean}[]
