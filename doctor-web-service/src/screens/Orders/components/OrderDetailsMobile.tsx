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
import AddDueDateContainer from './AddDueDateContainer'
import useDispatchAction from '@hooks/useDispatchAction'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import orderStatusConstants from '@constants/orderStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const OrderDetailsMobile = () => {
  const {userId} = useContext(AuthContext)
  const {order} = useSelector((state: RootState) => state.orders)
  const [open, setOpen] = useState(false)
  const {isDesignLabUser, isVendor, isAlignerCompanyOrg, isPractice} = useAllUserPlan()
  const orderDetails = order.order_details
  const isPurchaseOrder = order?.is_purchase_order
  const is_customer_order = order?.is_customer_order
  const isShowManufacturingStatus =
    (isPractice && !is_customer_order) ||
    (isAlignerCompanyOrg && !isPurchaseOrder && !is_customer_order)
  const {permissionChecks} = useFeatureAccess()
  const permissions =
    permissionChecks?.practiceOrderManagement?.dueByDate ||
    permissionChecks?.customerOrderManagement?.dueByDate

  const {dispatchAction} = useDispatchAction()
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
            {'Order details'}
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
        <When isTrue={(isDesignLabUser || isVendor) && order?.status === 'STL_FILES_UPLOADED'}>
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
          {orderDetails?.order_type === 'PLANNING_ORDER' ? 'Planning' : 'Scanning'}
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
          </div>{' '}
        </When>
        <div className='text-textColor text-sm font-medium leading-tight tracking-tight'>
          {!order?.is_purchase_order ? 'Received from' : 'Sent to'}
        </div>
        <div className='text-black text-base font-normal  leading-normal'>
          {order?.is_purchase_order
            ? order?.order_details?.target_user_details?.lab_name
            : order?.is_customer_order
              ? orderDetails?.target_user_details?.lab_name
              : order?.patient_details?.assigned_practice?.name}
        </div>
      </div>
      <MarkOrderAsCompletedModal {...{open, setOpen}} />
    </>
  )
}

export default OrderDetailsMobile
