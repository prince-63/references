import {Tabs} from 'antd'
import {useSearchParams} from 'react-router-dom'
import LabList from 'screens/Labs/LabList/LabList'
import practiceFilterConstants from '@constants/practiceFilter.constants'

const AccessControlLabsList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'pending' | 'connected') || 'pending'

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => setSearchParams({tab: key})}
      destroyOnHidden
      items={[
        {
          label: 'Pending',
          key: 'pending',
          children: <LabList key='pending' initialActiveTab={practiceFilterConstants.PENDING} />,
        },
        {
          label: 'Connected',
          key: 'connected',
          children: <LabList key='connected' initialActiveTab={practiceFilterConstants.ACCEPTED} />,
        },
      ]}
    />
  )
}

export default AccessControlLabsList
