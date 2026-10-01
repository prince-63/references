import orderStatusConstants from '@constants/orderStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import CrossIcon from 'assets/icons/CrossIcon'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  cancelOrder,
  getOrderDetails,
  setIsShowCancelOrderModal,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import * as Yup from 'yup'

const schema = Yup.object().shape({
  remarks: Yup.string().required('This field is required.').min(2, 'minimum 2 characters required'),
})
const CancelOrder = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {isShowCancelOrderModal, order} = useSelector((state: RootState) => state.orders)

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        remarks: '',
      }}
      validationSchema={schema}
      onSubmit={(values, {resetForm}) => {
        const payload = {
          order_id: order.order_id,
          order_status: orderStatusConstants.CANCELLED,
          cancel_order: {
            remark: values.remarks,
          },
        }
        dispatchAction(cancelOrder(payload))
          .unwrap()
          .then(() => {
            SuccessToast('Order cancelled')
            dispatchAction(
              getOrderDetails({
                doctor_id: safeParseInt(userId),
                order_id: order.order_id,
              })
            )
            dispatchAction(setIsShowCancelOrderModal(false))
            resetForm()
          })
      }}
    >
      {(formik) => {
        return (
          <Modal
            closable={false}
            destroyOnClose={true}
            centered={true}
            open={isShowCancelOrderModal}
            className={clsx('md:w-[566px] w-full')}
            maskClosable={false}
            width={566}
            footer={
              <div className={clsx('flex gap-2 md:px-5 md:pb-5 md:pt-3')}>
                <button
                  className={clsx(
                    'w-full text-red border border-red bg-redSupport py-3 px-6 rounded-lg font-semibold'
                  )}
                  type='button'
                  onClick={() => {
                    formik?.resetForm()
                    dispatchAction(setIsShowCancelOrderModal(false))
                  }}
                >
                  Go back
                </button>
                <AntdButton
                  className='w-full text-white !bg-red h-12 rounded-lg hover:!bg-red'
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  text='Cancel order'
                  htmlType='submit'
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
          >
            <div className='flex flex-col gap-5 md:pt-5 md:px-5 '>
              <div className=''>
                <div className={clsx('md:text-2xl text-xl font-semibold')}>Cancel order? </div>
                <div className='text-textColor font-normal'>
                  This action is permanent. Please add a remark and confirm to proceed with
                  cancellation.{' '}
                </div>
              </div>
              <div>
                <div className='text-textColor font-normal'>Cancelling the order will: </div>
                <div className='flex gap-2 items-center'>
                  <CrossIcon color='red' />
                  <div>Disable all actions permanently — only view access remains.</div>
                </div>
                <div className='flex gap-2 items-center'>
                  <CrossIcon color='red' /> <div>Prevent any future updates or changes.</div>
                </div>
              </div>
              <div className='flex flex-col gap-3'>
                <FormikInputTextArea
                  name='remarks'
                  label='Remarks'
                  placeholder=''
                  required={true}
                  maxLength={1000}
                />
              </div>
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default CancelOrder
