import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import moment from 'moment'
import {PaymentDetail} from '../types/payments.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setIsPaymentModalVisible,
  setSelectedPaymentId,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import hasValue from 'utils/hasValue'

export const PaymentCard = () => {
  const {dispatchAction} = useDispatchAction()
  const {paymentDetail} = useSelector((state: RootState) => state.payments)

  return (
    <div>
      {Object.entries(paymentDetail.payments).map(([date, paymentList]: any) => (
        <div key={date}>
          <div className="text-stone-500 text-sm font-semibold font-['Figtree'] leading-tight tracking-tight">
            {moment(date).format('MMMM YYYY')}
          </div>
          {paymentList.map((element: PaymentDetail) => (
            <div
              key={element.payment_id}
              className='flex flex-col my-3 cursor-pointer hover:bg-primarySupport'
              onClick={() => {
                dispatchAction(setIsPaymentModalVisible(true))
                dispatchAction(setSelectedPaymentId(element.payment_id))
              }}
            >
              <div className='h-20 pl-5 pr-4 rounded-lg border border-neutral-200 justify-between items-center inline-flex'>
                <div className='flex flex-row gap-2 flex-[10]'>
                  <div className='flex flex-col md:flex-row md:gap-2'>
                    <div className='text-black/opacity-20 text-base font-semibold leading-normal'>
                      {element.name}
                    </div>
                    <div
                      className={`text-center text-sm font-medium  leading-tight md:hidden text-textColor`}
                    >
                      {moment(element.date).format("dddd, DD MMM 'YY")}
                    </div>
                  </div>
                </div>
                <div className='w-[30%] h-20 pl-5 pr-4 justify-start items-center gap-2 md:inline-flex hidden'>
                  <div className={`text-center text-sm font-medium  leading-tight`}>
                    {moment(element.date).format("dddd, DD MMM 'YY")}
                  </div>
                </div>
                <div className='md:w-[30%] h-20 pl-5 pr-4 justify-start items-center gap-2 inline-flex'>
                  <div className={`text-center text-sm font-semibold  leading-tight`}>
                    {hasValue(element.amount)
                      ? '₹ ' + Number(element.amount).toLocaleString('en-IN')
                      : '--'}
                  </div>
                </div>
                <div className='flex-[0.1] flex items-center justify-center'>
                  <div className='flex gap-2'>
                    <div className='w-8 h-8 rounded-2xl justify-center items-center gap-2 inline-flex'>
                      <CommonSVG svg={SVG_EXPAND_RIGHT} height='15' width='15' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
