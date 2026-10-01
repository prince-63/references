import orderStatusConstants from '@constants/orderStatus.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {Formik} from 'formik'
import {useSelector} from 'react-redux'
import {
  getOrderDetails,
  needMoreInfo,
  setIsShowNeedMoreInfoModal,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import {RootState} from 'redux/store'
import * as Yup from 'yup'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'

const schema = Yup.object().shape({
  remarks: Yup.string().required('This field is required.').min(2, 'minimum 2 characters required'),
})
const NeedMoreInfo = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {isShowNeedMoreInfoModal, order} = useSelector((state: RootState) => state.orders)

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
          order_status: orderStatusConstants.NEED_MORE_INFO,
          is_need_more_info_updated: null,
          need_more_info: {
            remark: values.remarks,
          },
        }
        dispatchAction(needMoreInfo(payload))
          .unwrap()
          .then(() => {
            dispatchAction(
              getOrderDetails({
                doctor_id: safeParseInt(userId),
                order_id: order.order_id,
              })
            )
            dispatchAction(setIsShowNeedMoreInfoModal(false))
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
            open={isShowNeedMoreInfoModal}
            className={clsx('md:w-[566px] w-full')}
            maskClosable={false}
            width={566}
            footer={
              <div className={clsx('flex gap-2 md:px-5 md:pb-5 md:pt-3')}>
                <button
                  className={clsx(
                    'w-full text-primaryColor border border-primaryColor bg-primarySupport py-3 px-6 rounded-lg font-semibold'
                  )}
                  type='button'
                  onClick={() => {
                    formik?.resetForm()
                    dispatchAction(setIsShowNeedMoreInfoModal(false))
                  }}
                >
                  Go back
                </button>
                <AntdButton
                  className='w-full text-white !bg-primaryColor h-12 rounded-lg'
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  text='Request Info'
                  htmlType='submit'
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            }
          >
            <div className='flex flex-col gap-5 md:pt-5 md:px-5 '>
              <div className=''>
                <div className={clsx('md:text-2xl text-xl font-semibold')}>
                  Need More Information?
                </div>
                <div className='text-textColor font-normal'>
                  Allow the practice to edit and resubmit the order with updated details.
                </div>
              </div>
              <div>
                <div className='text-textColor font-normal'>Requesting more info will: </div>
                <div className='flex gap-2 items-center'>
                  <div className='w-[4px] h-[4px] bg-black rounded-full'></div>
                  <div>Enable the sender to edit order.</div>
                </div>
                <div className='flex gap-2 items-center'>
                  <div className='w-[4px] h-[4px] bg-black rounded-full'></div>
                  <div>Make order read-only until updated details are received.</div>
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

export default NeedMoreInfo
