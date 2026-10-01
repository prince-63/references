import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import userOrderDetails from '../hooks/userOrderDetails'
import {safeParseInt} from 'utils/ConstFunctions'
import {getOrderDetails, updateOrder} from 'redux/Slices/AppSlice/orders/orders.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import orderStatusConstants from '@constants/orderStatus.constants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const MarkOrderAsCompletedModal = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {order} = userOrderDetails()
  const {updatingOrder} = useSelector((state: RootState) => state.orders)

  return (
    <Modal
      destroyOnClose={true}
      style={{fontFamily: 'figtree'}}
      closable={false}
      open={open}
      width={500}
      centered
      footer={
        <div className='flex justify-between gap-2'>
          <button
            className=' w-full rounded-lg h-11 px-5 text-primaryColor border border-primaryColor bg-primarySupport justify-start'
            type='button'
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancel
          </button>
          <AntdButton
            key='submit'
            text={'Mark as completed'}
            htmlType='submit'
            className='h-11 w-full bg-primaryColor text-center'
            loading={updatingOrder}
            onClick={async () => {
              dispatchAction(
                updateOrder({
                  status: orderStatusConstants.COMPLETED,
                  order_id: order?.order_id,
                  doctor_id: safeParseInt(order?.doctor_id),
                })
              )
                .unwrap()
                .then(() => {
                  if (!order?.order_id) return
                  dispatchAction(
                    getOrderDetails({
                      doctor_id: safeParseInt(order?.doctor_id),
                      order_id: order?.order_id,
                      retrieve_treatment_plan: true,
                    })
                  )
                  setOpen(false)
                })
            }}
          />
        </div>
      }
    >
      <div className='flex flex-col gap-1 text-center'>
        <p className='font-semibold text-2xl text-black'>Mark order as complete?</p>
        <p className='text-textColor text-base'>
          This action is irreversible. Are you sure you want to continue?
        </p>
      </div>
    </Modal>
  )
}

export default MarkOrderAsCompletedModal
