import useDashboard from '@hooks/useDashboard'
import {Divider} from 'antd'
import ActionItem from 'screens/Dashboard/components/ActionItem'
import BorderedCardForDashBoardCards from 'screens/Dashboard/components/BorderedCard'
import {DashboardTypeListItem} from 'screens/Dashboard/dashboard/types/dashboard.types'

const PendingTasks = ({
  handleFilterChange,
}: {
  handleFilterChange: (option: DashboardTypeListItem['value']) => void
}) => {
  const {professional_plan} = useDashboard()

  return (
    <BorderedCardForDashBoardCards className='flex-grow-0'>
      <p className='font-medium'>Pending tasks</p>
      <Divider className='my-0' />
      <ActionItem
        {...{
          title: 'Workspace',
          count: professional_plan?.home?.pending_tasks?.workspace,
          onClick: () => {
            handleFilterChange('WORKSPACE')
          },
        }}
      />
      <Divider className='my-0' />
      <ActionItem
        {...{
          title: 'Customer view',
          count: professional_plan?.home?.pending_tasks?.customer_view,
          onClick: () => {
            handleFilterChange('CUSTOMER_VIEW')
          },
        }}
      />
    </BorderedCardForDashBoardCards>
  )
}

export default PendingTasks
