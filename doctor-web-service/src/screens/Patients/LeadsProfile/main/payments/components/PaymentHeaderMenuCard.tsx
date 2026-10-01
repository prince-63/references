import React from 'react'
import {capitalizeFirstLetter} from '../../appointments/utils/DateConversion'
import {listType} from '../types/payments.types'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setIsPaymentModalVisible,
  setIsTreatmentCostModalVisible,
  setSelectedPaymentId,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {useNavigate, useParams} from 'react-router-dom'

interface PropsTypes {
  paymentHeaderMenuList: listType[]
}

const PaymentHeaderMenuCard = (props: PropsTypes) => {
  const {paymentHeaderMenuList} = props
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {patientId} = useParams()

  const handleClick = (element: listType) => {
    dispatchAction(setSelectedPaymentId(0))
    if (element.title === 'ADD_PAYMENT') {
      dispatchAction(setIsPaymentModalVisible(true))
    } else if (element.title === 'REMINDERS') {
      navigation(`/profile/${patientId}/payments/paymentReminders`)
    } else if (element.title === 'EDIT_TREATMENT_COST') {
      dispatchAction(setIsTreatmentCostModalVisible(true))
    }
  }

  return (
    <div className='flex md:flex-row flex-col justify-between gap-3 my-4'>
      {paymentHeaderMenuList.map((element: listType, index) => {
        return (
          <div
            key={index}
            className='flex-1 rounded-lg border bg-white border-mediumGray cursor-pointer hover:bg-primarySupport p-4 justify-start items-center gap-3 inline-flex'
            onClick={() => handleClick(element)}
          >
            <div className='w-6 h-6 relative'>
              <div className='w-5 h-3.5'>{element.icon}</div>
            </div>
            <div className="grow shrink basis-0 text-black/opacity-20 text-base font-semibold font-['Figtree'] leading-normal">
              {capitalizeFirstLetter(element.title)}
            </div>
            <div
              className='w-8 h-8 rounded-2xl justify-center items-center gap-2 inline-flex cursor-pointer'
              onClick={() => null}
            >
              <CommonSVG svg={SVG_EXPAND_RIGHT} height='15' width='15' />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PaymentHeaderMenuCard
