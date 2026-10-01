import React from 'react'
import {Divider} from 'antd'
import ActionItem from '../../components/ActionItem'

import BorderedCardForDashBoardCards from '../../components/BorderedCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import {resetOrderFilters, setOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import {DashboardTypeListItem} from 'screens/Dashboard/dashboard/types/dashboard.types'
import When from 'components/when/When'
import useDashboard from '@hooks/useDashboard'

const NeedsAttention = ({filter}: {filter: Record<DashboardTypeListItem['value'], boolean>}) => {
  const {enterprise_lab_staff} = useDashboard(true)
  const needsAttention = filter.PRACTICE_ORDER
    ? enterprise_lab_staff?.practice_order?.need_attention
    : enterprise_lab_staff?.customer_orders?.need_attention
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  return (
    <BorderedCardForDashBoardCards>
      <p className='font-medium'>Needs Attention</p>
      <Divider className='my-0' />
      <ActionItem
        {...{
          title: 'Urgent orders',
          subTitle: 'Orders marked as urgent by customers.',
          count: needsAttention?.urgent_orders,
          onClick: () => {
            dispatchAction(resetOrderFilters())
            if (filter.PRACTICE_ORDER) {
              navigate(`/aligner-orders`)
            } else {
              const queryParams = new URLSearchParams({
                customerOrders: 'true',
              }).toString()
              navigate(`/orders?${queryParams}`)
            }
          },
        }}
      />
      <Divider className='my-0' />
      <ActionItem
        {...{
          title: 'In Re-Plan',
          subTitle: 'Orders sent back for adjustments or re-planning.',
          count: needsAttention?.in_re_plan,
          onClick: () => {
            dispatchAction(
              setOrderFilters({
                filterByOrderStatus: 'RE_PLAN',
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
          },
        }}
      />
      <Divider className='my-0' />
      <When isTrue={filter.CUSTOMER_ORDER}>
        <ActionItem
          {...{
            title: 'STL files requested',
            subTitle: 'Pending STL files requested for further processing.',
            count: needsAttention?.stl_files_requested,
            onClick: () => {
              dispatchAction(
                setOrderFilters({
                  filterByOrderStatus: 'STL_FILES_REQUESTED',
                })
              )
              const queryParams = new URLSearchParams({
                customerOrders: 'true',
              }).toString()
              navigate(`/orders?${queryParams}`)
            },
          }}
        />
        <Divider className='my-0' />
      </When>
      <ActionItem
        {...{
          title: 'Due today',
          subTitle: 'View orders with a due date set for today.',
          count: needsAttention?.due_today,
          onClick: () => {
            dispatchAction(
              setOrderFilters({
                filterByDueBy: 'DUE_TODAY',
              })
            )
            if (filter.PRACTICE_ORDER) {
              navigate(`/aligner-orders`)
            } else {
              navigate(`/unprocessed-orders`)
            }
          },
        }}
      />
      <Divider className='my-0' />
      <ActionItem
        {...{
          title: 'Overdue',
          subTitle: 'Track orders with due dates that have already passed.',
          count: needsAttention?.overdue,
          onClick: () => {
            dispatchAction(
              setOrderFilters({
                filterByDueBy: 'OVERDUE',
              })
            )
            if (filter.PRACTICE_ORDER) {
              navigate(`/aligner-orders`)
            } else {
              const queryParams = new URLSearchParams({
                customerOrders: 'true',
              }).toString()
              navigate(`/unprocessed-orders?${queryParams}`)
            }
          },
        }}
      />
    </BorderedCardForDashBoardCards>
  )
}

export default NeedsAttention
