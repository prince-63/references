import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import OrderStatusTag from './OrderStatusTag'
import AntdButton from 'components/atom/Buttons/AntdButton'
import cn from '@utils/cn'
import CheckIcon from 'assets/icons/CheckIcon'
import MarkOrderAsCompletedModal from './MarkOrderAsCompletedModal'
import {useContext, useState} from 'react'
import {Select} from 'antd'
import {safeParseInt} from 'utils/ConstFunctions'
import {getOrderDetails, updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AddDueDateContainer from './AddDueDateContainer'
import orderStatusConstants from '@constants/orderStatus.constants'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const OrderDetails = () => {
  const {order, activeUsers} = useSelector((state: RootState) => state.orders)
  const [open, setOpen] = useState(false)
  const {
    isPractice,
    isAlignerCompanyOrg,
    isDesignLabUser,
    isVendor,
    isOrganization,
    isEnterprisePlanUser,
  } = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const orderDetails = order.order_details
  const {userId, userDetail} = useContext(AuthContext)
  const userDisplayName = userDetail?.default_profile?.display_name
  const [assigningUser, setAssigningUser] = useState(false)
  const isPurchaseOrder = order?.is_purchase_order
  const is_customer_order = order?.is_customer_order
  const isShowManufacturingStatus =
    (isPractice && !is_customer_order) ||
    (isAlignerCompanyOrg && !isPurchaseOrder && !is_customer_order)
  const {permissionChecks} = useFeatureAccess()
  const permissions =
    permissionChecks?.practiceOrderManagement?.dueByDate ||
    permissionChecks?.customerOrderManagement?.dueByDate

  const assignReAssignOrder =
    permissionChecks?.customerOrderManagement?.assignReAssignOrder?.isViewable ||
    permissionChecks?.practiceOrderManagement?.assignReAssignOrder?.isViewable

  const refreshData = () => {
    dispatchAction(
      getOrderDetails({
        doctor_id: safeParseInt(userId),
        order_id: order?.order_id,
        retrieve_treatment_plan: true,
        updateLoadingState: false,
      })
    )
  }
  const manufacturing_status =
    order?.manufacturing_status === 'DELIVERED' &&
    order?.unprocessed_aligner_details?.total_aligners === 0
      ? 'MANUFACTURING_COMPLETED'
      : (order?.manufacturing_status ?? 'PENDING')

  const order_status = order && order?.status === 'COMPLETED' ? manufacturing_status : order?.status
  return (
    <>
      <div className=' p-5 flex border border-mediumGray   rounded-lg flex-col gap-2 w-full '>
        <div className=' text-textColor font-semibold text-lg flex justify-between items-center'>
          <span className='text-textColor text-base font-semibold  leading-normal'>
            {order?.is_purchase_order ? 'Order sent' : 'Order received'}
          </span>
        </div>
        <div className='text-textColor text-sm font-medium  leading-tight tracking-tight'>
          Order ID
        </div>
        <div className='flex  items-center gap-1'>
          <div className='text-black text-xl font-semibold  leading-7 uppercase'>
            <When isTrue={hasValue(order?.order_id)}>#{order?.order_id}</When>
          </div>
        </div>
        <div className=' h-[1px] bg-mediumGray w-full'></div>
        <div className='text-textColor text-sm font-medium  leading-tight tracking-tight'>
          Order status
        </div>
        {(isPractice || isAlignerCompanyOrg) && isShowManufacturingStatus ? (
          <OrderStatusTag
            status={order_status ?? ''}
            className='w-full py-2 !justify-start text-start'
            isShowManufacturingStatus={true}
          />
        ) : (
          <OrderStatusTag status={order?.status ?? ''} isShowManufacturingStatus={false} />
        )}

        <When
          isTrue={
            (isDesignLabUser || isEnterprisePlanUser || isVendor) &&
            order?.status === 'STL_FILES_UPLOADED'
          }
        >
          <AntdButton
            text={
              <div className='flex gap-2 items-center text-sm font-semibold'>
                <CheckIcon color='white' />
                <p>Mark as completed</p>
              </div>
            }
            className={cn(
              'h-12 text-base bg-primaryColor border border-primaryColor  hover:!bg-primaryColor hover:!text-white font-semibold text-white mt-1',
              'w-full'
            )}
            onClick={() => {
              setOpen(true)
            }}
          />
        </When>
        <div className=' h-[1px] bg-mediumGray w-full mt-1'></div>
        <div className='text-textColor text-sm font-medium  leading-tight tracking-tight'>
          Order type
        </div>
        <div className='text-black text-base font-normal  leading-normal'>
          {order?.is_practice_order ? 'Aligner Order' : 'Planning Order'}
        </div>
        <When
          isTrue={
            !order?.is_purchase_order &&
            permissionChecks?.practiceOrderManagement?.dueByDate?.isViewable &&
            order.status !== orderStatusConstants.CANCELLED &&
            order.status !== orderStatusConstants.COMPLETED
          }
        >
          <div className='text-textColor mt-2 text-sm font-medium  leading-tight tracking-tight'>
            Due by
          </div>
          <div className='h-6 justify-start items-center gap-2 inline-flex'>
            <AddDueDateContainer
              order_due_by={orderDetails?.due_by}
              order_id={order.order_id}
              refreshData={refreshData}
              permissions={permissions}
            />
          </div>
        </When>
        <div className='text-textColor text-sm font-medium leading-tight tracking-tight'>
          {!order?.is_purchase_order ? 'Received from' : 'Sent to'}
        </div>
        <div className='text-black text-base font-normal  leading-normal'>
          {order?.is_purchase_order
            ? order?.order_details?.target_user_details?.lab_name
            : order?.order_owner_name}
        </div>
        <When isTrue={(isDesignLabUser || isVendor || isOrganization) && assignReAssignOrder}>
          <div className=' h-[1px] bg-mediumGray w-full'></div>
          <div className='text-textColor text-sm font-medium leading-tight tracking-tight'>
            Assigned user
          </div>
          <Select
            options={activeUsers}
            showSearch={true}
            disabled={
              hasValue(order?.purchase_order_details) ||
              assigningUser ||
              order?.status === orderStatusConstants.CANCELLED ||
              order?.status === orderStatusConstants.NEED_MORE_INFO
            }
            loading={assigningUser}
            className='w-full'
            onClick={(e) => e.stopPropagation()}
            value={
              order?.is_purchase_order || hasValue(order?.purchase_order_details)
                ? userDisplayName
                : activeUsers.find((user) => user.value === order?.assigned_lab_user_id)
            }
            placeholder='Select user'
            dropdownRender={(menu) => (
              <div>
                <div className='text-textColor uppercase p-2 text-xs'>Assign user</div>
                {menu}
              </div>
            )}
            onChange={async (value) => {
              setAssigningUser(true)
              dispatchAction(
                updateOrder({
                  order_id: order?.order_id,
                  doctor_id: safeParseInt(order?.doctor_id),

                  assigned_user_details: {
                    assigned_user_name:
                      activeUsers.find((activeUser) => activeUser.value === safeParseInt(value))
                        ?.label ?? '',
                    assigned_user_profile_id: safeParseInt(value),
                  },
                  status: order?.status === 'ORDERED' ? 'IN_PROGRESS' : order?.status,
                })
              )
                .unwrap()
                .then(async () => {
                  if (!order?.order_id) return
                  dispatchAction(
                    getOrderDetails({
                      doctor_id: safeParseInt(userId),
                      order_id: order?.order_id,
                      retrieve_treatment_plan: true,
                      updateLoadingState: false,
                    })
                  )
                    .unwrap()
                    .then(() => {
                      setAssigningUser(false)
                    })
                })
            }}
          />
        </When>
      </div>
      <MarkOrderAsCompletedModal {...{open, setOpen}} />
    </>
  )
}

export default OrderDetails
