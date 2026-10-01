import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import moment from 'moment'
import OrderStatusTag from './OrderStatusTag'
import MarkOrderAsCompletedModal from './MarkOrderAsCompletedModal'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import useAllUserPlan from '@hooks/useAllUserPlan'

const LinkedOrderDetails = () => {
  const {order} = useSelector((state: RootState) => state.orders)
  const [open, setOpen] = useState(false)
  const purchaseOrderDetails = order.purchase_order_details
  const navigation = useNavigate()
  const {isOrganization} = useAllUserPlan()
  return (
    <>
      <div className=' p-5 flex border border-mediumGray   rounded-lg flex-col gap-2 w-full '>
        <div className=' text-textColor font-semibold text-lg flex justify-between items-center'>
          <span className='text-textColor text-base font-semibold  leading-normal'>
            {!order.is_purchase_order ? 'Order sent' : 'Order received'}
          </span>
        </div>
        <div className='text-textColor text-sm font-medium  leading-tight tracking-tight'>
          {!order.is_purchase_order ? 'Purchase order ID' : 'Customer order ID'}
        </div>
        <div className='flex  items-center gap-1'>
          <a
            className='text-primaryColor text-base font-semibold uppercase underline cursor-pointer hover:text-primaryColor hover:no-underline'
            onClick={(e) => {
              e.stopPropagation()
              if (purchaseOrderDetails?.status === 'DRAFT' && isOrganization) {
                navigation(`/orders/create-order/${purchaseOrderDetails?.order_id}`, {
                  replace: true,
                  state: {isClone: true},
                })
              } else {
                navigation(`/orders/${purchaseOrderDetails?.order_id}`)
              }
            }}
          >
            <When isTrue={hasValue(purchaseOrderDetails?.order_id)}>
              #{purchaseOrderDetails?.order_id}
            </When>
          </a>
        </div>
        <div className=' h-[1px] bg-mediumGray w-full'></div>
        <div className='text-textColor text-sm font-medium  leading-tight tracking-tight'>
          Order status
        </div>

        {purchaseOrderDetails?.status && (
          <OrderStatusTag
            status={purchaseOrderDetails?.status}
            className='w-full py-2 !justify-start text-start'
            isShowManufacturingStatus={false}
          />
        )}

        <div className=' h-[1px] bg-mediumGray w-full mt-1'></div>

        <div className='text-textColor mt-2 text-sm font-medium  leading-tight tracking-tight'>
          Due by
        </div>
        <div className='h-6 justify-start items-center gap-2 inline-flex'>
          <div className='text-black text-base font-normal  leading-normal'>
            {moment(purchaseOrderDetails?.due_by).format('DD-MMM-YYYY')}
          </div>
          <When isTrue={purchaseOrderDetails?.is_urgent}>
            <div className='justify-center items-center gap-1 flex'>
              <div className='w-2 h-2 bg-[#be8901] rounded-full' />
              <div className='text-[#be8901] text-xs font-semibold  leading-none tracking-tight'>
                Urgent
              </div>
            </div>
          </When>
        </div>
      </div>
      <MarkOrderAsCompletedModal {...{open, setOpen}} />
    </>
  )
}

export default LinkedOrderDetails
