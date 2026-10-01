import {useState} from 'react'
import Page from 'components/page/Page'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_COMING_SOON_CALENDER} from 'utils/ImageConst'
import useDispatchAction from '@hooks/useDispatchAction'
import {setSelectedPaymentReminderId} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import {PaymentReminderCard} from './components/PaymentReminderCard'
import {SVG_PLUS_BLUE} from 'utils/SvgConstants'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import PaymentDeleteModal from './components/PaymentAndReminderDeleteModal'
import AddReminderModal from 'components/AddReminder/AddReminderModal'

const PaymentReminders = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()

  const {paymentDetail, getPaymentDetailLoading, isDeletePaymentReminderModalVisible} = useSelector(
    (state: RootState) => state.payments
  )

  const [isModalVisible, setIsModalVisible] = useState(false)
  const toggleModal = (value: boolean) => {
    setIsModalVisible(value)
  }

  const toggleAddReminderFormContainer = (value: boolean) => {
    toggleModal(value)
  }

  return (
    <Page
      title='Payment reminders'
      showBackButton={true}
      backNavigationRoute={`/profile/${patientId}/payments`}
      loading={getPaymentDetailLoading}
      extraHeader={
        <button
          className='rounded-lg px-3 md:py-2 py-1 w-fit border text-[14px] border-secondaryColor bg-secondarySupport text-secondaryColor font-semibold flex items-center gap-2'
          onClick={() => {
            dispatchAction(setSelectedPaymentReminderId(0))
            toggleAddReminderFormContainer(true)
          }}
        >
          <CommonSVG svg={SVG_PLUS_BLUE} width='16' height='16' className='hidden md:flex' />
          Add reminder
        </button>
      }
    >
      <When isTrue={isDeletePaymentReminderModalVisible}>
        <PaymentDeleteModal />
      </When>
      <AddReminderModal
        {...{
          isModalVisible,
          toggleModal,
          isOnPaymentsPage: true,
        }}
      />

      <When isTrue={!hasValue(paymentDetail?.reminders)}>
        <CommonEmptyState
          image={IMAGE_COMING_SOON_CALENDER}
          imageStyle={'w-[200px] h-[160px] mb-4'}
          boxStyle='gap-2 h-[25rem] text-center'
          title=''
          titleStyle='mt-[13px] text-[20px] mt-4 font-semibold'
          subTitleStyle=''
          subTitle='No payment reminders added yet'
          buttonText=''
          buttonStyle=''
          onClick={() => null}
        />
      </When>
      <When isTrue={hasValue(paymentDetail?.reminders)}>
        <PaymentReminderCard {...{toggleAddReminderFormContainer}} />
      </When>
    </Page>
  )
}

export default PaymentReminders
