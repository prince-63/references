import React from 'react'
import {Divider} from 'antd'
import ActionItem from '../../components/ActionItem'

import ColorIcon from 'components/colorIcon/ColorIcon'
import BorderedCardForDashBoardCards from '../../components/BorderedCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import {resetOrderFilters, setOrderFilters} from 'redux/Slices/AppSlice/orders/orders.slice'
import When from 'components/when/When'
import {DashboardTypeListItem} from 'screens/Dashboard/dashboard/types/dashboard.types'
import useDashboard from '@hooks/useDashboard'
import useAllUserPlan from '@hooks/useAllUserPlan'

const CustomerActionPending = ({
  filter,
}: {
  filter: Record<DashboardTypeListItem['value'], boolean>
}) => {
  const {enterprise_lab_staff} = useDashboard(true)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {isDesignLabUser, isEnterprisePlanUser} = useAllUserPlan()
  const pending_actions = filter.PRACTICE_ORDER
    ? enterprise_lab_staff?.practice_order?.customer_action_pending
    : enterprise_lab_staff?.customer_orders?.customer_action_pending
  return (
    <BorderedCardForDashBoardCards>
      <p className='font-medium'>Customer action pending</p>
      <When isTrue={isDesignLabUser || isEnterprisePlanUser}>
        <div className='flex gap-2 text-sm  text-black font-medium'>
          {pending_actions?.active}
          <span className='text-textColor'>Active</span>
          <span className='text-textColor'>|</span> {pending_actions?.invited}
          <span className='text-textColor'>Invited</span>
        </div>
      </When>
      <Divider className='my-0' />
      <ActionItem
        {...{
          title: (
            <div className='flex gap-2 items-center'>
              <ColorIcon {...{color: '#8B5CF6'}} />
              <p className=''>In Review</p>
            </div>
          ),
          count: filter.PRACTICE_ORDER
            ? enterprise_lab_staff?.practice_order?.in_review
            : enterprise_lab_staff?.customer_orders?.in_review,
          onClick: () => {
            dispatchAction(resetOrderFilters())

            dispatchAction(
              setOrderFilters({
                filterByOrderStatus: 'IN_REVIEW',
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
          title: (
            <div className='flex gap-2 items-center'>
              <ColorIcon
                {...{
                  color: '#22C55E',
                }}
              />
              <p className=''>Approved</p>
            </div>
          ),
          count: pending_actions?.approved,
          onClick: () => {
            dispatchAction(resetOrderFilters())

            dispatchAction(
              setOrderFilters({
                filterByOrderStatus: 'APPROVED',
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
      {filter.CUSTOMER_ORDER && (
        <>
          <Divider className='my-0' />
          <ActionItem
            {...{
              title: (
                <div className='flex gap-2 items-center'>
                  <ColorIcon
                    {...{
                      color: '#06B6D4',
                    }}
                  />
                  <p className=''>STL files uploaded</p>
                </div>
              ),
              count: pending_actions?.stl_files_uploaded,
              onClick: () => {
                dispatchAction(resetOrderFilters())

                dispatchAction(
                  setOrderFilters({
                    filterByOrderStatus: 'STL_FILES_UPLOADED',
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
        </>
      )}
    </BorderedCardForDashBoardCards>
  )
}

export default CustomerActionPending
