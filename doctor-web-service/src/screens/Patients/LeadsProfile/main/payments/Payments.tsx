import React, {useContext, useEffect, useState} from 'react'
import Page from 'components/page/Page'
import PaymentHeaderCard from './components/PaymentHeaderCard'
import RupeeIcon from 'assets/icons/RupeeIcon'
import TimerIcon from 'assets/icons/TimerIcon'
import {listType} from './types/payments.types'
import PaymentHeaderMenuCard from './components/PaymentHeaderMenuCard'
import IconAddPayment from 'assets/icons/IconAddPayment'
import IconReminders from 'assets/icons/IconReminders'
import IconEdit from 'assets/icons/IconEdit'
import {PaymentCard} from './components/PaymentCard'
import CommonEmptyState from 'components/emptyState/CommonEmptyState'
import {IMAGE_NO_PAYMENT_ADDED} from 'utils/ImageConst'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {
  getPaymentDetail,
  setIsPaymentModalVisible,
  setIsTreatmentCostModalVisible,
  setPaymentDetails,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import TreatmentCostModal from './components/TreatmentCostModal'
import PaymentModal from './components/PaymentModal'
import PaymentDeleteModal from './components/PaymentAndReminderDeleteModal'
import {SVG_PLUS_PRIMARY} from 'utils/SvgConstants'

const Payments = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()

  const {
    paymentDetail,
    getPaymentDetailLoading,
    isTreatmentCostModalVisible,
    isPaymentModalVisible,
    isDeletePaymentModalVisible,
  } = useSelector((state: RootState) => state.payments)

  const [paymentHeaderList, setPaymentHeaderList] = useState<listType[]>([])
  const paymentHeaderMenuList: listType[] = [
    {
      icon: <IconAddPayment height='24' width='24' />,
      title: 'ADD_PAYMENT',
    },
    {
      icon: <IconReminders height='24' width='24' />,
      title: 'REMINDERS',
      value: '',
    },
    {
      icon: <IconEdit height='24' width='24' />,
      title: 'EDIT_TREATMENT_COST',
    },
  ]

  useEffect(() => {
    dispatchAction(setPaymentDetails({}))
    callGetPayment()
  }, [isPaymentModalVisible, isDeletePaymentModalVisible, isTreatmentCostModalVisible])

  const callGetPayment = () => {
    dispatchAction(
      getPaymentDetail({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
      })
    )
      .unwrap()
      .then((res: any) => {
        if (res) {
          const tempArray = [
            {
              icon: <RupeeIcon height='24' width='24' />,
              title: 'TREATMENT_COST',
              value: res.cost,
            },
            {
              icon: <TimerIcon height='24' width='24' />,
              title: 'BALANCE_PAYMENT',
              value: res.balance_payment,
            },
          ]
          setPaymentHeaderList(tempArray)
        }
      })
      .catch(() => {})
  }

  return (
    <Page title='Payments' loading={getPaymentDetailLoading}>
      <When isTrue={isTreatmentCostModalVisible}>
        <TreatmentCostModal />
      </When>
      <When isTrue={!hasValue(paymentDetail)}>
        <CommonEmptyState
          boxStyle='gap-5 h-[25rem] text-center'
          image={IMAGE_NO_PAYMENT_ADDED}
          subTitle='No treatment cost added yet'
          buttonText={'Add treatment cost'}
          buttonStyle='md:w-[35%] h-14 border border-primaryColor bg-primarySupport text-primaryColor rounded-[8px] font-semibold px-4'
          buttonIcon={SVG_PLUS_PRIMARY}
          onClick={() => dispatchAction(setIsTreatmentCostModalVisible(true))}
        />
      </When>
      <When isTrue={hasValue(paymentDetail)}>
        <When isTrue={isPaymentModalVisible}>
          <PaymentModal />
        </When>
        <When isTrue={isDeletePaymentModalVisible}>
          <PaymentDeleteModal />
        </When>
        <When isTrue={!getPaymentDetailLoading}>
          <PaymentHeaderCard paymentHeaderList={paymentHeaderList} />
        </When>
        <PaymentHeaderMenuCard paymentHeaderMenuList={paymentHeaderMenuList} />
        <When isTrue={!hasValue(paymentDetail?.payments)}>
          <CommonEmptyState
            boxStyle='gap-5 h-[25rem] text-center'
            image={IMAGE_NO_PAYMENT_ADDED}
            subTitle='No payments added'
            buttonText={'Add payment'}
            buttonStyle='md:w-[35%] h-14 border border-primaryColor bg-primarySupport text-primaryColor rounded-[8px] font-semibold px-4'
            buttonIcon={SVG_PLUS_PRIMARY}
            onClick={() => dispatchAction(setIsPaymentModalVisible(true))}
          />
        </When>
        <When isTrue={hasValue(paymentDetail?.payments)}>
          <PaymentCard />
        </When>
      </When>
    </Page>
  )
}

export default Payments
