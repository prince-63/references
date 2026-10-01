import {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Spin} from 'antd'
import moment from 'moment'

type CountBoxForPracticeProps = {
  isVspPlanning?: boolean
}

const CountBoxForPractice = ({isVspPlanning = false}: CountBoxForPracticeProps) => {
  const {miniDashboardData, loadingMiniDashboard} = useSelector((state: RootState) => state.profile)

  const metrics = useMemo(() => {
    if (!miniDashboardData || Array.isArray(miniDashboardData)) return []

    const totalOrders = Number(miniDashboardData.total_customer_orders) || 0
    const totalPatients = Number(miniDashboardData.total_patients) || 0
    const lastOrderAt = miniDashboardData.last_order_at
    const customerTrackingEnabled = miniDashboardData.customer_tracking_enabled
      ? 'Enabled'
      : 'Disabled'

    const lastOrderDisplay = (() => {
      if (!lastOrderAt) return '—'
      const lastDate = moment(lastOrderAt)
      if (!lastDate.isValid()) return '—'
      const now = moment()
      if (lastDate.isAfter(now)) return lastDate.format('DD MMM YYYY')
      const diffDays = now.clone().startOf('day').diff(lastDate.clone().startOf('day'), 'days')
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      return `${diffDays}d ago`
    })()

    const baseMetrics = [
      {
        key: 'total_patients',
        title: 'Patients',
        value: totalPatients.toLocaleString(),
      },
      {
        key: 'total_customer_orders',
        title: 'Orders',
        value: totalOrders.toLocaleString(),
      },
      {
        key: 'last_order_at',
        title: 'Last Order',
        value: lastOrderDisplay,
      },
    ]

    if (!isVspPlanning) {
      baseMetrics.push({
        key: 'customer_tracking_enabled',
        title: 'Tracking',
        value: customerTrackingEnabled,
      })
    }

    return baseMetrics
  }, [miniDashboardData, isVspPlanning])

  return (
    <Spin spinning={loadingMiniDashboard}>
      <div className='w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className='border rounded-lg px-4 py-3 min-w-32 flex-1 bg-[#F5F5F5] border-mediumGray'
          >
            <p className='text-sm font-medium text-textColor'>{metric.title}</p>
            <p className='text-xl font-semibold break-words'>{metric.value}</p>
          </div>
        ))}
        {!loadingMiniDashboard && metrics.length === 0 && (
          <div className='text-sm text-textColor col-span-full'>
            No dashboard data available for this practice.
          </div>
        )}
      </div>
    </Spin>
  )
}

export default CountBoxForPractice
