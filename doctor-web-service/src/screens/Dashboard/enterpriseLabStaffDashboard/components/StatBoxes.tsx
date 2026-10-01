import React from 'react'
import StatBox from '../../components/StatBox'
import useDispatchAction from '@hooks/useDispatchAction'
import {resetOrderFilters, setOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import {useNavigate} from 'react-router-dom'
import {OrderCounts} from '../types/practicesDashboard.types'
import orderStatusConstants from '@constants/orderStatus.constants'
import {DashboardTypeListItem} from 'screens/Dashboard/dashboard/types/dashboard.types'

interface StatBoxesProps {
  counts: any
  filter: Record<DashboardTypeListItem['value'], boolean>
}
const StatBoxes: React.FC<StatBoxesProps> = ({counts, filter}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  return (
    <div className='flex gap-3 overflow-x-auto md:flex-wrap'>
      {orderDashboardStatsList.map((stat) => {
        if (
          (stat.value === 'STL_FILES_REQUESTED' || stat.value === 'STL_FILES_UPLOADED') &&
          filter.PRACTICE_ORDER
        ) {
          return null
        }

        return (
          <StatBox
            key={stat.value}
            title={stat.label}
            count={counts[stat.mappedKey as keyof OrderCounts] || 0}
            color={stat.color}
            onClick={() => {
              dispatchAction(resetOrderFilters())

              dispatchAction(
                setOrderFilters({
                  filterByOrderStatus: stat.value,
                })
              )
              if (filter.PRACTICE_ORDER) {
                navigate(`/aligner-orders`)
              } else {
                const queryParams = new URLSearchParams({
                  customerOrders: 'true',
                }).toString()
                navigate(`/orders?${queryParams}`)
              }
            }}
          />
        )
      })}
    </div>
  )
}

export default StatBoxes

const orderDashboardStatsList = [
  {
    label: 'Ordered',
    value: orderStatusConstants.ORDERED,
    color: '#0EA5E9',
    mappedKey: 'ordered',
  },
  {
    label: 'In Progress',
    value: orderStatusConstants.IN_PROGRESS,
    color: '#F97316',
    mappedKey: 'in_progress',
  },
  {
    label: 'In Review',
    value: orderStatusConstants.IN_REVIEW,
    color: '#8B5CF6',
    mappedKey: 'in_review',
  },
  {
    label: 'Re-plan',
    value: orderStatusConstants.RE_PLAN,
    color: '#E53935',
    mappedKey: 'replan',
  },
  {
    label: 'Approved',
    value: orderStatusConstants.APPROVED,
    color: '#22C55E',
    mappedKey: 'approved',
  },
  {
    label: 'STL files requested',
    value: orderStatusConstants.STL_FILES_REQUESTED,
    color: '#EAB308',
    mappedKey: 'stl_files_requested',
  },
  {
    label: 'STL files uploaded',
    value: orderStatusConstants.STL_FILES_UPLOADED,
    color: '#06B6D4',
    mappedKey: 'stl_files_uploaded',
  },
  {
    label: 'Completed',
    value: orderStatusConstants.COMPLETED,
    color: '#059669',
    mappedKey: 'completed',
  },
]
