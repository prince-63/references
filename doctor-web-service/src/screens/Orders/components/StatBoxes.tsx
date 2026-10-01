import useDispatchAction from '@hooks/useDispatchAction'
import {setOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import {ordersPageFilterBar} from '../orders.types'
import StatBox from 'screens/Dashboard/components/StatBox'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {OrderCounts} from 'screens/Dashboard/enterpriseLabStaffDashboard/types/practicesDashboard.types'
import orderDashboardStatsListForEnterprise from '@staticData/orderDashboardStatsListForEnterprise'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useDashboard from '@hooks/useDashboard'

const StatBoxes = ({filter}: {filter: ordersPageFilterBar}) => {
  const {orderFilters} = useSelector((state: RootState) => state.orders)
  const {isProfessionalPlanUser, isGrowthPlanUser} = useAllUserPlan()
  const {
    received_order_all_details,
    enterprise_professional_plan,
    professional_plan,
    growth_plan,
    design_lab,
    third_party_customer,
    third_party_lab,
  } = useDashboard()
  const {isDesignLabUser, isOrganization, isPractice, isVendor} = useAllUserPlan()

  const normalizeCountsData = (countsData: any) => {
    if (!countsData) return {}

    const normalized = {...countsData}

    // Handle STL file key normalization
    if (normalized.stl_file_requested !== undefined) {
      normalized.stl_files_requested = normalized.stl_file_requested
      delete normalized.stl_file_requested
    }

    if (normalized.stl_files_approved !== undefined) {
      normalized.stl_files_uploaded = normalized.stl_files_approved
      delete normalized.stl_files_approved
    }

    if (normalized.stl_file_approved !== undefined) {
      normalized.stl_files_uploaded = normalized.stl_file_approved
      delete normalized.stl_file_approved
    }

    // Handle in_re_plan mapping to replan
    if (normalized.in_re_plan !== undefined) {
      normalized.replan = normalized.in_re_plan
      delete normalized.in_re_plan
    }

    // Handle total calculation
    const countableKeys = [
      'draft',
      'ordered',
      'in_progress',
      'in_review',
      'approved',
      'stl_files_requested',
      'stl_files_uploaded',
      'replan', // using the normalized key
      'completed',
      'cancelled',
      'need_more_info',
    ]

    const calculatedTotal = countableKeys.reduce((sum, key) => {
      const value = normalized[key]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)

    if (normalized.total !== undefined && normalized.total > 0) {
      normalized.total = normalized.total
    } else {
      normalized.total = calculatedTotal
    }

    return normalized
  }

  const countsMap = {
    CUSTOMER: normalizeCountsData(enterprise_professional_plan?.home?.customers_orders?.orders),
    PRACTICE: normalizeCountsData(enterprise_professional_plan?.customer_orders?.orders),
    LABS: normalizeCountsData(enterprise_professional_plan?.lab_orders?.orders),
    SENT_ORDER: normalizeCountsData(
      isPractice || isOrganization
        ? isProfessionalPlanUser
          ? professional_plan?.customer_view?.orders
          : isGrowthPlanUser
            ? growth_plan?.home?.orders_sent
            : enterprise_professional_plan?.lab_orders?.orders
        : third_party_customer?.orders
    ),
    RECEIVED_ORDER: normalizeCountsData(
      isDesignLabUser
        ? design_lab?.orders
        : isVendor
          ? third_party_lab?.orders
          : (isPractice || isOrganization) && isProfessionalPlanUser
            ? professional_plan?.customer_view?.orders
            : received_order_all_details?.count
    ),
  }

  const defaultOrderCounts: OrderCounts = {
    total: 0,
    draft: 0,
    ordered: 0,
    in_progress: 0,
    in_review: 0,
    replan: 0,
    approved: 0,
    completed: 0,
    stl_files_requested: 0,
    stl_files_uploaded: 0,
    cancelled: 0,
    need_more_info: 0,
  }

  const counts: OrderCounts = filter?.CUSTOMER
    ? {...defaultOrderCounts, ...(countsMap.CUSTOMER ?? {})}
    : filter?.SENT
      ? {...defaultOrderCounts, ...(countsMap.SENT_ORDER ?? countsMap.LABS)}
      : filter?.RECEIVED
        ? {...defaultOrderCounts, ...(countsMap.RECEIVED_ORDER ?? {})}
        : {...defaultOrderCounts, ...(countsMap.SENT_ORDER ?? {})}

  const {dispatchAction} = useDispatchAction()

  return (
    <div className='flex gap-3 overflow-x-auto md:flex-wrap'>
      {orderDashboardStatsListForEnterprise.map((stat) => {
        if (
          filter?.RECEIVED &&
          (isProfessionalPlanUser || isGrowthPlanUser) &&
          (stat.value === 'STL_FILES_REQUESTED' ||
            stat.value === 'STL_FILES_UPLOADED' ||
            stat.value === 'DRAFT')
        ) {
          return null
        }
        if (stat.value === 'NEED_MORE_INFO') {
          return null
        }
        if (stat.value === 'CANCELLED') {
          return null
        }

        return (
          <StatBox
            key={stat.value}
            title={stat.label}
            count={counts[stat.mappedKey as keyof OrderCounts] || 0}
            color={stat.color}
            className={
              stat.value === orderFilters.filterByOrderStatus ? 'border border-primaryColor' : ''
            }
            onClick={() => {
              dispatchAction(
                setOrderFilters({
                  filterByOrderStatus: stat.value,
                })
              )
            }}
          />
        )
      })}
    </div>
  )
}

export default StatBoxes
