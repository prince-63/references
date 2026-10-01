import React from 'react'
import {Divider} from 'antd'
import ActionItem from '../../components/ActionItem'
import BorderedCardForDashBoardCards from '../../components/BorderedCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import {resetOrderFilters, setOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import {DashboardTypeListItem} from 'screens/Dashboard/dashboard/types/dashboard.types'
import useDashboard from '@hooks/useDashboard'

const MyTasks = ({filter}: {filter: Record<DashboardTypeListItem['value'], boolean>}) => {
  const {enterprise_lab_staff} = useDashboard(true)
  const taskPractice = enterprise_lab_staff?.practice_order?.my_task
  const taskCustomer = enterprise_lab_staff?.customer_orders?.my_task
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()

  const task = filter.PRACTICE_ORDER ? taskPractice : taskCustomer
  return (
    <BorderedCardForDashBoardCards>
      <p className='font-medium'>My tasks</p>
      <Divider className='my-0' />

      <ActionItem
        {...{
          title: 'In Progress',
          subTitle: 'Track orders currently being processed.',
          count: task?.in_progress,
          onClick: () => {
            dispatchAction(resetOrderFilters())

            dispatchAction(
              setOrderFilters({
                filterByOrderStatus: 'IN_PROGRESS',
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
      <ActionItem
        {...{
          title: 'Review assigned orders to me',
          subTitle: 'Review and manage orders specifically assigned to you.',
          count: task?.review_assigned_orders_to_me,
          onClick: () => {
            dispatchAction(resetOrderFilters())

            dispatchAction(
              setOrderFilters({
                filterByAssignedUser: 'ASSIGNED_TO_ME',
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
    </BorderedCardForDashBoardCards>
  )
}

export default MyTasks
