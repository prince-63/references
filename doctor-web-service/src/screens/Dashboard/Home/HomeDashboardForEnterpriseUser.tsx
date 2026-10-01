import Page from 'components/page/Page'
import When from 'components/when/When'
import {ReactNode} from 'react'
import useDashboard from '@hooks/useDashboard'
import DropdownRightArrow from 'assets/icons/VIewStatsIcon copy'
import AlignerOrders from './components/AlignerOrders'
import OrdersSentToLabs from './components/OrdersSentToLabs'
import PlanningOrders from './components/PlanningOrders'
import {DashboardTypeListItem} from '../dashboard/types/dashboard.types'

const HomeDashboardForEnterpriseUser = ({
  handleFilterChange,
}: {
  handleFilterChange: (option: DashboardTypeListItem['value']) => void
}) => {
  const {loadingDashboard, enterprise_professional_plan} = useDashboard(true)

  return (
    <Page loading={loadingDashboard}>
      <CardWrapper
        title={'Practice orders'}
        onclick={() => {
          handleFilterChange('WORKSPACE')
        }}
        pending_updates={enterprise_professional_plan?.home?.practice_orders?.pending_updates ?? 0}
      >
        <AlignerOrders />
      </CardWrapper>

      <CardWrapper
        title={'Customer orders'}
        onclick={() => {
          handleFilterChange('CUSTOMER_VIEW')
        }}
        pending_updates={enterprise_professional_plan?.home?.customers_orders?.pending_updates ?? 0}
      >
        <PlanningOrders />
      </CardWrapper>

      <CardWrapper
        title={'Lab orders'}
        onclick={() => {
          handleFilterChange('LABEL_VIEW')
        }}
        pending_updates={enterprise_professional_plan?.home?.lab_orders.pending_updates ?? 0}
      >
        <OrdersSentToLabs />
      </CardWrapper>
    </Page>
  )
}

export default HomeDashboardForEnterpriseUser

const CardWrapper = ({
  title,
  onclick,
  pending_updates,
  children,
}: {
  title: string
  onclick: () => void
  pending_updates: number
  children: ReactNode
}) => {
  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='flex flex-col md:flex-row md:items-center md:gap-3'>
        <div className='text-2xl font-semibold'>{title}</div>
        <div className='flex flex-row items-center gap-3'>
          <When isTrue={pending_updates !== 0}>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-orange'></div>
              <div className='text-sm font-medium'>{pending_updates}</div>
              <div className='text-textColor text-sm font-medium'>Pending updates</div>
            </div>
          </When>
          <button
            className='flex gap-2 items-center text-sm font-semibold text-textColor'
            onClick={onclick}
          >
            <div>View all</div>
            <DropdownRightArrow color='#666' />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}
