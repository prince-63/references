import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {
  postDeletePayment,
  postDeletePaymentReminder,
  setIsDeletePaymentModalVisible,
  setIsDeletePaymentReminderModalVisible,
  setIsPaymentModalVisible,
  setSelectedPaymentId,
  setSelectedPaymentReminderId,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useFormikContext} from 'formik'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'

const PaymentAndReminderDeleteModal = ({
  isOnBillingsAndPaymentsPage,
  patientPaymentReceivedData,
}: {
  isOnBillingsAndPaymentsPage?: boolean
  patientPaymentReceivedData?: {
    patientId: number
    patientName?: string
    profileUrl?: string | null
  }
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId: patientIdFromParams} = useParams()
  const patientId = !isOnBillingsAndPaymentsPage
    ? patientIdFromParams
    : patientPaymentReceivedData?.patientId
  const {userId}: any = useContext(AuthContext)
  const billingPageFormik = useFormikContext<FilterDrawerFormikContextType>()

  const {selectedPaymentId, postDeletePaymentLoading, selectedPaymentReminderId} = useSelector(
    (state: RootState) => state.payments
  )

  const handleClickDeleteItem = async () => {
    await dispatchAction(
      selectedPaymentId != 0
        ? postDeletePayment({
            payment_id: safeParseInt(selectedPaymentId),
            doctor_id: safeParseInt(userId),
            patient_id: safeParseInt(patientId),
          })
        : postDeletePaymentReminder({
            reminder_id: safeParseInt(selectedPaymentReminderId),
            doctor_id: safeParseInt(userId),
            patient_id: safeParseInt(patientId),
          })
    )
      .unwrap()
      .then((res: any) => {
        if (res) {
          if (isOnBillingsAndPaymentsPage) {
            billingPageFormik.handleSubmit()
          }
          dispatchAction(setSelectedPaymentId(0))
          dispatchAction(setSelectedPaymentReminderId(0))
          if (selectedPaymentId != 0) {
            dispatchAction(setIsDeletePaymentModalVisible(false))
            dispatchAction(setIsPaymentModalVisible(false))
            SuccessToast('Payment deleted successfully.')
          } else {
            dispatchAction(setIsDeletePaymentReminderModalVisible(false))
            SuccessToast('Reminder deleted successfully.')
          }
        }
      })
      .catch(() => {})
  }

  return (
    <ModalLayout className='md:w-[32%] p-2' isResponsive>
      <div className='w-auto text-center text-black text-xl font-semibold leading-loose'>
        {`Are you sure you want to delete the ${
          selectedPaymentId != 0 ? 'payment ?' : 'reminder ?'
        }`}
      </div>

      <div className='flex mt-4 gap-4'>
        <button
          className='w-full h-12 rounded-lg p-3 cursor-pointer !bg-redSupport border border-red text-red'
          onClick={() =>
            selectedPaymentId != 0
              ? dispatchAction(setIsDeletePaymentModalVisible(false))
              : dispatchAction(setIsDeletePaymentReminderModalVisible(false))
          }
        >
          Cancel
        </button>
        <AntdButton
          text={selectedPaymentId != 0 ? 'Delete payment' : 'Delete reminder'}
          className='h-12 bg-red border border-red hover:!bg-red w-full text-[16px] text-white font-semibold'
          loading={postDeletePaymentLoading}
          onClick={() => handleClickDeleteItem()}
        />
      </div>
    </ModalLayout>
  )
}

export default PaymentAndReminderDeleteModal
